import {
  BmsFault,
  CellReading,
  DailyEnergyPoint,
  FieldProvenance,
  OPERATING_STATE,
  OperatingStateCode,
  RackExtremes,
  RackModule,
  RackTelemetry,
  SeriesPoint,
  SystemTelemetry,
} from '../types/bms.types';

/* =============================================================================
   BMS TELEMETRY — simulation layer

   The single source of truth for every number the BMS workspace renders.

   Why this file exists
   --------------------
   Before this, each screen carried its own literals: the overview hardcoded
   52.8 V, the module grid called Math.random() on every rack change, and the
   cell map generated a third unrelated set. Rack-level figures could therefore
   contradict the modules they were supposedly aggregating, which is fatal for
   an engineering diagnostics screen.

   Everything here is generated once per device, deterministically, and
   aggregated upward:

       cells  →  module  →  rack  →  system

   so a rack's voltage really is the series sum of its modules, and a rack's
   reported minimum cell voltage really is the lowest cell in that rack.

   Replacing this with a real backend
   ----------------------------------
   Components consume only the types in `types/bms.types.ts`. When the schema
   gains the tables listed in TELEMETRY_PROVENANCE, `getSystemTelemetry()` can
   be replaced by a query/subscription of the same shape and no component needs
   to change.
   ========================================================================== */

/* -----------------------------------------------------------------------------
   Deterministic randomness

   A monitoring screen whose values reshuffle on re-render is unusable for
   diagnosis, and it makes rack totals disagree with module rows. Every value
   below is therefore a pure function of a seed derived from its own identity.
   -------------------------------------------------------------------------- */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good enough for visual simulation. */
function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number, dp = 2) => Number(value.toFixed(dp));

/* -----------------------------------------------------------------------------
   Topology

   Matches the configuration the existing UI already advertises: four racks of
   twelve modules, with the 52-cell series the cell map was built around.
   -------------------------------------------------------------------------- */

export const TOPOLOGY = {
  racks: 4,
  modulesPerRack: 12,
  cellsPerModule: 52,
} as const;

/* -----------------------------------------------------------------------------
   Fault catalogue

   These codes and names are the ones already present in this codebase's alert
   data — they are not invented here. A fault is only ever surfaced with its
   name attached, which is what the type system enforces.
   -------------------------------------------------------------------------- */

const FAULT_CATALOGUE = {
  cellUnderVoltage: {
    code: 'UV-2101',
    name: 'Cell Under Voltage',
    severity: 'fault' as const,
    detail:
      'A cell held below the configured under-voltage threshold under load. Balancing has been requested; if the spread persists across two cycles the cell should be flagged for replacement.',
  },
  moduleOverTemperature: {
    code: 'OT-1140',
    name: 'Module Over Temperature',
    severity: 'warning' as const,
    detail:
      'A module probe exceeded its warning threshold. Airflow at the rack inlet should be checked before the next charge cycle.',
  },
  communicationLoss: {
    code: 'LINK-4004',
    name: 'Module Communication Loss',
    severity: 'fault' as const,
    detail:
      'No CAN frames received from the module within the timeout window. The gateway is reachable, so the fault is most likely on the rack CAN segment.',
  },
  cellImbalance: {
    code: 'IMB-3007',
    name: 'Cell Imbalance',
    severity: 'warning' as const,
    detail:
      'Cell-voltage spread inside the module exceeded its limit. Passive balancing engaged; expected to resolve within two full cycles.',
  },
} as const;

/* -----------------------------------------------------------------------------
   Known anomalies

   Preserved from the original mock generators so the screens keep telling the
   same story they told before: rack 1 has a hot module and a dead link, rack 2
   has an imbalance, rack 3 has a hard fault, rack 4 is clean.
   -------------------------------------------------------------------------- */

interface ModuleAnomaly {
  rack: number;
  module: number;
  kind: 'overTemp' | 'offline' | 'imbalance' | 'fault';
}

const MODULE_ANOMALIES: ModuleAnomaly[] = [
  { rack: 1, module: 3, kind: 'overTemp' },
  { rack: 1, module: 4, kind: 'offline' },
  { rack: 2, module: 8, kind: 'imbalance' },
  { rack: 3, module: 11, kind: 'fault' },
];

/* -----------------------------------------------------------------------------
   Cell generation
   -------------------------------------------------------------------------- */

interface GeneratedCell {
  module: number;
  cell: number;
  voltageMv: number;
  soc: number;
  soh: number;
  temperature: number;
}

function generateCells(
  deviceId: string,
  rackIndex: number,
  moduleIndex: number,
  anomaly: ModuleAnomaly | undefined,
): GeneratedCell[] {
  const rng = makeRng(hashSeed(`${deviceId}:r${rackIndex}:m${moduleIndex}:cells`));
  const cells: GeneratedCell[] = [];

  /* Module-to-module variance is kept inside the configured balancing limits so
     that a healthy rack reads healthy. If nominal spread already exceeded the
     limit, the "outside limit" flag would fire on every rack and mean nothing. */
  const baseTemp = anomaly?.kind === 'overTemp' ? 37.4 : 28 + rng() * 3;
  const baseSoc = 80 + rng() * 3;
  const baseSoh = 96 + rng() * 2;

  for (let c = 1; c <= TOPOLOGY.cellsPerModule; c += 1) {
    let voltageMv = 3690 + Math.round(rng() * 24);
    let soc = baseSoc + (rng() - 0.5) * 1.8;
    let soh = baseSoh - rng() * 0.8;
    let temperature = baseTemp + (rng() - 0.5) * 1.8;

    // The under-voltage cell the alert log already refers to.
    if (anomaly?.kind === 'imbalance' && c === 12) {
      voltageMv = 3420;
      soc = baseSoc - 11;
      soh = baseSoh - 5.5;
    }
    if (rackIndex === 1 && moduleIndex === 1 && c === 12) {
      voltageMv = 3420;
      soc = baseSoc - 12.5;
      soh = baseSoh - 6.2;
    }
    if (anomaly?.kind === 'overTemp' && c === 26) {
      temperature = 42.6;
    }

    cells.push({
      module: moduleIndex,
      cell: c,
      voltageMv,
      soc: round(soc, 1),
      soh: round(soh, 1),
      temperature: round(temperature, 1),
    });
  }

  return cells;
}

/**
 * Cells for one module, as rendered by the (currently hidden) cell view.
 *
 * Exposed so that screen reads the same generated cells the rack extremes were
 * computed from — otherwise the cell map and the extremes table would disagree
 * about the same hardware.
 */
export function getModuleCells(deviceId: string, rackIndex: number, moduleIndex: number) {
  const anomaly = MODULE_ANOMALIES.find((a) => a.rack === rackIndex && a.module === moduleIndex);
  return generateCells(deviceId, rackIndex, moduleIndex, anomaly);
}

/* -----------------------------------------------------------------------------
   Extremes

   Computed by scanning the rack's real cells, so every extreme carries the
   module and cell it actually came from.
   -------------------------------------------------------------------------- */

function toReading(cell: GeneratedCell, value: number): CellReading {
  return { value, module: cell.module, cell: cell.cell };
}

function computeExtremes(cells: GeneratedCell[]): RackExtremes {
  const pick = (
    key: 'voltageMv' | 'soc' | 'soh' | 'temperature',
    direction: 'min' | 'max',
  ): CellReading => {
    let best = cells[0];
    for (const cell of cells) {
      const isBetter = direction === 'min' ? cell[key] < best[key] : cell[key] > best[key];
      if (isBetter) best = cell;
    }
    return toReading(best, best[key]);
  };

  return {
    minCellVoltage: pick('voltageMv', 'min'),
    maxCellVoltage: pick('voltageMv', 'max'),
    minCellSoc: pick('soc', 'min'),
    maxCellSoc: pick('soc', 'max'),
    minCellSoh: pick('soh', 'min'),
    maxCellSoh: pick('soh', 'max'),
    minTemperature: pick('temperature', 'min'),
    maxTemperature: pick('temperature', 'max'),
  };
}

/* -----------------------------------------------------------------------------
   Rack assembly
   -------------------------------------------------------------------------- */

function faultForAnomaly(anomaly: ModuleAnomaly, rackName: string): BmsFault {
  const raisedAt = new Date(Date.now() - 15 * 60_000).toISOString();
  const source = `${rackName} · Module ${String(anomaly.module).padStart(2, '0')}`;

  switch (anomaly.kind) {
    case 'fault':
      return { ...FAULT_CATALOGUE.communicationLoss, source, raisedAt };
    case 'offline':
      return { ...FAULT_CATALOGUE.communicationLoss, source, raisedAt };
    case 'overTemp':
      return { ...FAULT_CATALOGUE.moduleOverTemperature, source, raisedAt };
    case 'imbalance':
    default:
      return { ...FAULT_CATALOGUE.cellImbalance, source, raisedAt };
  }
}

function generateRack(deviceId: string, rackIndex: number): RackTelemetry {
  const rng = makeRng(hashSeed(`${deviceId}:rack:${rackIndex}`));
  const name = `Rack ${rackIndex}`;

  const modules: RackModule[] = [];
  const allCells: GeneratedCell[] = [];

  for (let m = 1; m <= TOPOLOGY.modulesPerRack; m += 1) {
    const anomaly = MODULE_ANOMALIES.find((a) => a.rack === rackIndex && a.module === m);
    const cells = generateCells(deviceId, rackIndex, m, anomaly);
    allCells.push(...cells);

    const moduleRng = makeRng(hashSeed(`${deviceId}:r${rackIndex}:m${m}`));
    const voltage = 52 + moduleRng();
    const temperature = Math.max(...cells.map((c) => c.temperature));
    const soc = round(cells.reduce((s, c) => s + c.soc, 0) / cells.length, 1);
    const soh = round(cells.reduce((s, c) => s + c.soh, 0) / cells.length, 1);

    const voltages = cells.map((c) => c.voltageMv);
    const spreadV = (Math.max(...voltages) - Math.min(...voltages)) / 1000;

    const offline = anomaly?.kind === 'offline' || anomaly?.kind === 'fault';

    /* Health must follow the module's own readings, not just its injected
       anomaly: a module holding the widest cell spread in the rack cannot
       report Healthy, or the table contradicts the extremes above it. */
    const CELL_SPREAD_LIMIT_V = 0.25;
    let health: RackModule['health'] = 'Healthy';
    if (anomaly?.kind === 'fault') health = 'Fault';
    else if (anomaly?.kind === 'offline') health = 'Offline';
    else if (anomaly?.kind === 'overTemp' || anomaly?.kind === 'imbalance') health = 'Warning';
    else if (temperature > 35) health = 'Warning';
    else if (spreadV > CELL_SPREAD_LIMIT_V) health = 'Warning';

    modules.push({
      id: `rack-${rackIndex}-mod-${m}`,
      position: m,
      name: `Module ${String(m).padStart(2, '0')}`,
      voltage: round(voltage),
      temperature: round(temperature, 1),
      soc,
      soh,
      communication: offline ? 'Inactive' : 'Active',
      health,
      deltaV: spreadV > 0.08 ? round(spreadV) : null,
    });
  }

  // Series string: rack voltage is the sum of its modules.
  const voltage = round(modules.reduce((sum, m) => sum + m.voltage, 0), 1);

  /* Current sign follows the convention used across the app:
     positive = discharge, negative = charge. Rack 2 is charging so the screens
     exercise both directions; rack 4 sits idle. */
  let current: number;
  if (rackIndex === 2) current = -round(38 + rng() * 10, 1);
  else if (rackIndex === 4) current = round((rng() - 0.5) * 0.6, 1);
  else current = round(42 + rng() * 14, 1);

  const state: OperatingStateCode = deriveOperatingState(current);
  const power = round((voltage * current) / 1000, 2);

  const soc = round(modules.reduce((s, m) => s + m.soc, 0) / modules.length, 1);
  const soh = round(modules.reduce((s, m) => s + m.soh, 0) / modules.length, 1);

  const rackAnomaly = MODULE_ANOMALIES.filter((a) => a.rack === rackIndex).sort((a, b) =>
    a.kind === 'fault' ? -1 : b.kind === 'fault' ? 1 : 0,
  )[0];

  const contactorClosed = state !== OPERATING_STATE.IDLE || rackIndex !== 4;

  return {
    id: `rack-${rackIndex}`,
    name,
    voltage,
    current,
    power,
    soc,
    soh,
    cycleCount: 380 + Math.round(rng() * 90),
    /* Charged and discharged are physically related: what comes out is what
       went in, less round-trip loss. Generating them independently produced a
       meaningless efficiency figure on the overview. */
    ...(() => {
      const discharged = 110 + rng() * 60;
      const efficiency = 0.92 + rng() * 0.04;
      return {
        dailyChargedKwh: round(discharged / efficiency, 1),
        dailyDischargedKwh: round(discharged, 1),
      };
    })(),
    // Output voltage sits marginally below terminal voltage across the contactor.
    outputVoltage: contactorClosed ? round(voltage - 0.4 - rng() * 0.5, 1) : 0,
    state,
    fault: rackAnomaly ? faultForAnomaly(rackAnomaly, name) : null,
    contactorClosed,
    extremes: computeExtremes(allCells),
    modules,
  };
}

/* -----------------------------------------------------------------------------
   Operating state

   No backend field exists for this yet, so it is derived from current sign —
   the standard convention. The dead-band keeps float noise around zero from
   flickering the badge between charge and discharge.
   -------------------------------------------------------------------------- */

const IDLE_CURRENT_THRESHOLD_A = 1.0;

export function deriveOperatingState(currentA: number): OperatingStateCode {
  if (Math.abs(currentA) < IDLE_CURRENT_THRESHOLD_A) return OPERATING_STATE.IDLE;
  return currentA < 0 ? OPERATING_STATE.CHARGE : OPERATING_STATE.DISCHARGE;
}

/* -----------------------------------------------------------------------------
   System assembly

   Racks are paralleled: the battery sees the mean rack voltage and the sum of
   rack currents.
   -------------------------------------------------------------------------- */

const systemCache = new Map<string, SystemTelemetry>();

export function getSystemTelemetry(deviceId: string): SystemTelemetry {
  const cached = systemCache.get(deviceId);
  if (cached) return cached;

  const racks = Array.from({ length: TOPOLOGY.racks }, (_, i) =>
    generateRack(deviceId, i + 1),
  );

  const batteryVoltage = round(
    racks.reduce((s, r) => s + r.voltage, 0) / racks.length,
    1,
  );
  const batteryCurrent = round(
    racks.reduce((s, r) => s + r.current, 0),
    1,
  );
  const batteryPower = round(
    racks.reduce((s, r) => s + r.power, 0),
    2,
  );

  const soc = round(racks.reduce((s, r) => s + r.soc, 0) / racks.length, 1);
  const soh = round(racks.reduce((s, r) => s + r.soh, 0) / racks.length, 1);

  const ratedEnergyKwh = 1040;
  const batteryEnergyKwh = round((soc / 100) * ratedEnergyKwh, 1);

  const temperatures = racks.flatMap((r) => [
    r.extremes.maxTemperature.value,
    r.extremes.minTemperature.value,
  ]);

  // The most severe rack fault becomes the system fault.
  const fault =
    racks
      .map((r) => r.fault)
      .filter((f): f is BmsFault => Boolean(f))
      .sort((a, b) => (a.severity === 'fault' ? -1 : b.severity === 'fault' ? 1 : 0))[0] ?? null;

  const telemetry: SystemTelemetry = {
    batteryVoltage,
    batteryCurrent,
    batteryPower,
    batteryEnergyKwh,
    ratedEnergyKwh,
    soc,
    soh,
    dailyChargedKwh: round(racks.reduce((s, r) => s + r.dailyChargedKwh, 0), 1),
    dailyDischargedKwh: round(racks.reduce((s, r) => s + r.dailyDischargedKwh, 0), 1),
    state: deriveOperatingState(batteryCurrent),
    maxCellTemperature: round(Math.max(...temperatures), 1),
    minCellTemperature: round(Math.min(...temperatures), 1),
    cycleCount: Math.round(racks.reduce((s, r) => s + r.cycleCount, 0) / racks.length),
    fault,
    racks,
  };

  systemCache.set(deviceId, telemetry);
  return telemetry;
}

/* =============================================================================
   TIME SERIES

   No history table exists in the schema, so these are simulated. They are
   seeded per device + metric so a given chart is stable across renders and
   across tab switches.
   ========================================================================== */

function formatTimeLabel(date: Date, stepMinutes: number) {
  return stepMinutes >= 1440
    ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    : date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export interface SeriesOptions {
  points: number;
  stepMinutes: number;
  base: number;
  amplitude: number;
  /** Shifts the sine so series do not all peak together. */
  phase?: number;
  noise?: number;
  decimals?: number;
  clamp?: [number, number];
}

export function buildSeries(seedKey: string, options: SeriesOptions): SeriesPoint[] {
  const {
    points,
    stepMinutes,
    base,
    amplitude,
    phase = 0,
    noise = 0.3,
    decimals = 1,
    clamp,
  } = options;

  const rng = makeRng(hashSeed(seedKey));

  /* Align the window to the sampling step so labels land on round times —
     "09:00", not "09:42". A time axis that reads off-grid looks like a bug. */
  const stepMs = stepMinutes * 60_000;
  const end = Math.floor(Date.now() / stepMs) * stepMs;
  const start = end - points * stepMs;

  return Array.from({ length: points }, (_, index) => {
    const progress = index / Math.max(points - 1, 1);
    const cycle = Math.sin(progress * Math.PI * 2 + phase);
    const jitter = (rng() - 0.5) * amplitude * noise;
    const time = new Date(start + index * stepMs);

    let value = base + cycle * amplitude + jitter;
    if (clamp) value = Math.min(clamp[1], Math.max(clamp[0], value));

    return {
      t: time.getTime(),
      label: formatTimeLabel(time, stepMinutes),
      value: round(value, decimals),
    };
  });
}

/** Daily charge/discharge energy over the trailing `days` days. */
export function buildDailyEnergy(seedKey: string, days: number): DailyEnergyPoint[] {
  const rng = makeRng(hashSeed(`${seedKey}:daily-energy`));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));

    const weekday = date.getDay();
    // Site load drops at the weekend; the pattern makes the chart readable.
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.62 : 1;

    const discharged = (430 + rng() * 130) * weekendFactor;
    // Round-trip efficiency sits a little under unity.
    const charged = discharged / (0.92 + rng() * 0.04);

    return {
      t: date.getTime(),
      label: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      chargedKwh: round(charged, 1),
      dischargedKwh: round(discharged, 1),
    };
  });
}

/* =============================================================================
   PROVENANCE REGISTRY

   What is real, what is derived, and what is waiting on the backend. Surfaced
   in the UI under System Information so a reviewer can see the gap without
   reading the code.
   ========================================================================== */

export const TELEMETRY_PROVENANCE: FieldProvenance[] = [
  {
    label: 'Device name, location, type',
    provenance: 'mapped',
    backingField: 'devices.name / devices.location / devices.device_type',
  },
  {
    label: 'Connectivity status',
    provenance: 'mapped',
    backingField: 'devices.last_seen_at',
  },
  {
    label: 'Battery voltage',
    provenance: 'simulated',
    backingField: 'device_current_data.voltage',
    note: 'Column exists but is not yet populated with pack-level telemetry; the workspace aggregates simulated rack data instead so system and rack figures agree.',
  },
  {
    label: 'Battery current',
    provenance: 'simulated',
    backingField: 'device_current_data.current',
    note: 'Column exists. Sign convention (negative = charge) needs confirming with the BMS vendor.',
  },
  {
    label: 'Battery power',
    provenance: 'simulated',
    backingField: 'device_current_data.power',
    note: 'Column exists. Units must be settled — the schema stores a bare number, the UI renders kW.',
  },
  {
    label: 'Battery kWh / rated capacity',
    provenance: 'simulated',
    backingField: '— none —',
    note: 'No energy column. Needs stored_energy_kwh and rated_capacity_kwh on the telemetry record.',
  },
  {
    label: 'SOC, SOH',
    provenance: 'simulated',
    backingField: '— none —',
    note: 'No state-of-charge or state-of-health columns anywhere in the schema.',
  },
  {
    label: 'Daily charged / discharged kWh',
    provenance: 'simulated',
    backingField: '— none —',
    note: 'Requires daily energy counters, or an energy history table to integrate from.',
  },
  {
    label: 'Operating state (Idle / Charging / Discharging)',
    provenance: 'derived',
    backingField: '— none —',
    note: 'Derived from current sign with a 1 A dead-band. A dedicated system_state code (0/1/2) from the BMS would be authoritative.',
  },
  {
    label: 'Rack telemetry (voltage, current, power, SOC, SOH, cycles)',
    provenance: 'simulated',
    backingField: '— none —',
    note: 'No racks table. Needs a rack entity keyed to device_id.',
  },
  {
    label: 'Rack output voltage, state, contactor status',
    provenance: 'simulated',
    backingField: '— none —',
    note: 'Needs output_voltage, state and contactor_closed on the rack record.',
  },
  {
    label: 'Cell extremes (min/max voltage, SOC, SOH, temperature)',
    provenance: 'simulated',
    backingField: '— none —',
    note: 'No module or cell tables. Needs per-cell readings, or pre-computed extremes with module and cell indices.',
  },
  {
    label: 'Fault code and description',
    provenance: 'simulated',
    backingField: 'device_current_data.status',
    note: 'Only a free-text status string exists. Needs fault_code and fault_description so the UI never has to show a bare "FAULT".',
  },
  {
    label: 'Device coordinates / geofence',
    provenance: 'simulated',
    backingField: '— none —',
    note: 'devices.location is a free-text place name. The location map shows fixed DEMO coordinates from data/demoGeofence.ts, labelled as such wherever they appear, so the geofence interaction can be reviewed. Real siting needs latitude/longitude on the device record and a geofence boundary per device.',
  },
  {
    label: 'Historical trends (SOC, current, temperature, energy)',
    provenance: 'simulated',
    backingField: '— none —',
    note: 'No time-series table. Needs device_telemetry_history with a timestamp index.',
  },
];
