import type { AlertItem } from '../../components/AlertCard';
import type { BmsCell } from '../../components/bms/CellCard';
import type { BmsSensor } from '../../components/bms/SensorCard';
import {
  TELEMETRY_PROVENANCE,
  TOPOLOGY,
  buildDailyEnergy,
  buildSeries,
  getModuleCells,
  getSystemTelemetry,
} from '../../data/bmsTelemetry';
import { getDeviceSiting } from '../../data/demoGeofence';
import type { BmsFault, OperatingStateCode, RackModule, RackTelemetry, SystemTelemetry } from '../../types/bms.types';
import type { DeviceSiting } from '../../utils/geofence';
import {
  HISTORY_RANGES,
  type HistoryData,
  type HistoryRangeId,
  type ModuleDetail,
  type OverviewData,
  type RackData,
} from './types';

/* =============================================================================
   Demo source — SIMULATED data for layout preview only.

   The only module allowed to import the simulation in data/bmsTelemetry.ts and
   the demonstration siting in data/demoGeofence.ts (enforced by
   noMockImports.test.ts). It reproduces exactly what the original device
   screens generated internally, so the preview shows the full intended layout.

   Nothing here describes a real device. Every result is tagged
   `provenance: 'demo'`, and the workspace only renders it after the user
   explicitly asks for a preview, under a SIMULATED banner.
   ========================================================================== */

/* The original overview's static status facts and event list. */
const DEMO_FACTS = (telemetry: SystemTelemetry) => [
  { label: 'Uptime', value: '42d 06h' },
  { label: 'Last frame', value: '0.4s ago' },
  { label: 'Firmware', value: 'v2.14.3' },
  { label: 'Cycles', value: String(telemetry.cycleCount) },
];

const DEMO_OVERVIEW_EVENTS: AlertItem[] = [
  {
    type: 'warning',
    message: 'Module Over Temperature',
    time: '2 minutes ago',
    source: 'Rack 1 · Module 03',
    code: 'OT-1140',
    detail:
      'A module probe exceeded its warning threshold. Airflow at the rack inlet should be checked before the next charge cycle.',
  },
  {
    type: 'fault',
    message: 'Module Communication Loss',
    time: '15 minutes ago',
    source: 'Rack 3 · Module 11',
    code: 'LINK-4004',
    detail:
      'No CAN frames received from the module within the timeout window. The gateway is reachable, so the fault is most likely on the rack CAN segment.',
  },
  {
    type: 'info',
    message: 'Realtime connection established',
    time: 'Just now',
    source: 'Gateway · CAN-A',
    code: 'LINK-0001',
    detail: 'Telemetry stream resumed at a 1 s sample interval. No frames dropped since resync.',
  },
];

const DEMO_INFO_EVENTS: AlertItem[] = [
  {
    type: 'info',
    message: 'Realtime connection established',
    time: 'Just now',
    source: 'Gateway · CAN-A',
    code: 'LINK-0001',
    detail: 'Telemetry stream resumed at a 1 s sample interval. No frames dropped since resync.',
  },
  {
    type: 'info',
    message: 'Firmware update completed',
    time: '2 days ago',
    source: 'Device · controller',
    code: 'FW-2143',
    detail:
      'Controller updated to v2.14.3. Protection thresholds and calibration data were preserved through the update.',
  },
];

/* The original history screen's interval-storage sample. */
const DEMO_SOC_SAMPLES = [
  { timestamp: '2026-07-27T00:00:00Z', value: 78.2 },
  { timestamp: '2026-07-27T00:15:00Z', value: 78.2 },
  { timestamp: '2026-07-27T00:30:00Z', value: 78.5 },
  { timestamp: '2026-07-27T00:45:00Z', value: 78.5 },
  { timestamp: '2026-07-27T01:00:00Z', value: 77.9 },
  { timestamp: '2026-07-27T01:15:00Z', value: 77.9 },
  { timestamp: '2026-07-27T01:30:00Z', value: 79.1 },
  { timestamp: '2026-07-27T01:45:00Z', value: 79.1 },
];

/** Demonstration siting record, so a preview of any device can show the geofence map. */
const DEMO_SITING_KEY = 'BMS-A001';

/** Siting for a demo device: its own record if it has one; otherwise the sample one, or none. */
function demoSiting(identifier: string | undefined, fallbackToSample: boolean): DeviceSiting | null {
  return getDeviceSiting(identifier) ?? (fallbackToSample ? getDeviceSiting(DEMO_SITING_KEY) : null);
}

const seedKey = (deviceId: string) => deviceId || 'default';

function hottestSource(telemetry: SystemTelemetry) {
  let best = telemetry.racks[0];
  telemetry.racks.forEach((rack) => {
    if (rack.extremes.maxTemperature.value > best.extremes.maxTemperature.value) best = rack;
  });
  const reading = best.extremes.maxTemperature;
  return `${best.name} · Module ${String(reading.module).padStart(2, '0')}`;
}

/**
 * @param identifier the device's identifier; picks its demonstration siting.
 * @param fallbackToSample show the sample site's map when the device has none
 *   (layout preview); off in demo mode, where a unit never borrows another's position.
 */
export function buildDemoOverview(deviceId: string, identifier?: string, fallbackToSample = true): OverviewData {
  const key = seedKey(deviceId);
  const telemetry = getSystemTelemetry(key);

  const soc = buildSeries(`${key}:soc`, {
    points: 24,
    stepMinutes: 60,
    base: telemetry.soc,
    amplitude: 7,
    phase: -Math.PI / 2,
    decimals: 1,
    clamp: [0, 100],
  });
  const maxTemp = buildSeries(`${key}:max-cell-temp`, {
    points: 24,
    stepMinutes: 60,
    base: telemetry.maxCellTemperature - 3,
    amplitude: 4.5,
    decimals: 1,
  });
  const micro = (suffix: string, base: number, amplitude: number, decimals: number) =>
    buildSeries(`${key}:${suffix}`, { points: 8, stepMinutes: 5, base, amplitude, decimals }).map((p) => p.value);

  return {
    provenance: 'demo',
    readings: {
      voltage: telemetry.batteryVoltage,
      current: telemetry.batteryCurrent,
      powerKw: telemetry.batteryPower,
      soc: telemetry.soc,
      soh: telemetry.soh,
      energyKwh: telemetry.batteryEnergyKwh,
      ratedKwh: telemetry.ratedEnergyKwh,
      cycleCount: telemetry.cycleCount,
      packTemperature: null,
    },
    state: telemetry.state,
    fault: telemetry.fault,
    facts: DEMO_FACTS(telemetry),
    sampleInterval: '1s interval',
    streaming: true,
    cellTemperatures: {
      max: telemetry.maxCellTemperature,
      min: telemetry.minCellTemperature,
      avg: Number(((telemetry.maxCellTemperature + telemetry.minCellTemperature) / 2).toFixed(1)),
      hottestSource: hottestSource(telemetry),
    },
    energyToday: { charged: telemetry.dailyChargedKwh, discharged: telemetry.dailyDischargedKwh },
    protection: {
      contactorClosed: telemetry.racks.some((r) => r.contactorClosed),
      insulation: 842,
    },
    trends: {
      soc,
      temperature: maxTemp,
      temperatureKind: 'max-cell',
      voltage: micro('v-micro', telemetry.batteryVoltage, 1.6, 1),
      current: micro('i-micro', Math.abs(telemetry.batteryCurrent), 6, 1),
      powerKw: micro('p-micro', Math.abs(telemetry.batteryPower), 4, 2),
    },
    dailyEnergy: buildDailyEnergy(key, 14),
    events: DEMO_OVERVIEW_EVENTS,
    system: {
      systemVoltage: telemetry.batteryVoltage,
      configuration: `${TOPOLOGY.racks} racks · ${TOPOLOGY.racks * TOPOLOGY.modulesPerRack} modules`,
      ratedKwh: telemetry.ratedEnergyKwh,
      siting: demoSiting(identifier, fallbackToSample),
      dataSources: TELEMETRY_PROVENANCE.map((field) => ({
        label: field.label,
        status: 'demo' as const,
        source: field.backingField,
        note: field.note,
      })),
    },
  };
}

/* --------------------------------------------------------------- Header */

export interface DemoHeader {
  state: OperatingStateCode;
  fault: BmsFault | null;
  soc: number;
  soh: number;
  voltage: number;
  configuration: string;
  siting: DeviceSiting | null;
  /** Active rack faults/warnings, for the Alerts tab count. */
  activeAlerts: number;
}

/** The original workspace header's simulated figures, for demo mode. */
export function buildDemoHeader(deviceId: string, identifier?: string): DemoHeader {
  const telemetry = getSystemTelemetry(seedKey(deviceId));
  return {
    state: telemetry.state,
    fault: telemetry.fault,
    soc: telemetry.soc,
    soh: telemetry.soh,
    voltage: telemetry.batteryVoltage,
    configuration: `${telemetry.racks.length} racks · ${telemetry.racks.reduce((n, r) => n + r.modules.length, 0)} modules`,
    siting: demoSiting(identifier, false),
    activeAlerts: telemetry.racks.filter((rack) => rack.fault).length,
  };
}

/* ---------------------------------------------------------------- Racks */

const rackNumber = (rack: RackTelemetry, fallback: number) => {
  const match = /^rack-(\d+)$/.exec(rack.id);
  return match ? Number(match[1]) : fallback;
};

function demoCells(deviceId: string, rack: number, module: number): BmsCell[] {
  return getModuleCells(deviceId, rack, module).map((cell) => ({
    id: `cell-${cell.cell}`,
    name: `Cell ${String(cell.cell).padStart(2, '0')}`,
    voltage: cell.voltageMv,
    health: cell.voltageMv < 3600 || cell.voltageMv > 3750 ? 'Warning' : 'Healthy',
    balancing: cell.voltageMv > 3705,
  }));
}

function demoSensors(moduleId: string): BmsSensor[] {
  const hot = moduleId === 'rack-1-mod-1';
  return [
    { id: 'ntc-1', name: 'NTC 1', temperature: 29, status: 'Healthy' },
    { id: 'ntc-2', name: 'NTC 2', temperature: 30, status: 'Healthy' },
    { id: 'ntc-3', name: 'NTC 3', temperature: 31, status: 'Healthy' },
    { id: 'ntc-4', name: 'NTC 4', temperature: hot ? 45 : 32, status: hot ? 'Warning' : 'Healthy' },
  ];
}

export function buildDemoRacks(deviceId: string): RackData {
  const key = seedKey(deviceId);
  const { racks } = getSystemTelemetry(key);
  return {
    racks,
    cellsPerModule: TOPOLOGY.cellsPerModule,
    getModuleDetail: (rack: RackTelemetry, module: RackModule): ModuleDetail => ({
      cells: demoCells(key, rackNumber(rack, racks.indexOf(rack) + 1), module.position),
      sensors: demoSensors(module.id),
    }),
  };
}

/* -------------------------------------------------------------- History */

export function buildDemoHistory(deviceId: string, range: HistoryRangeId): HistoryData {
  const key = seedKey(deviceId);
  const telemetry = getSystemTelemetry(key);
  const [rack1, rack2] = telemetry.racks;
  const active = HISTORY_RANGES.find((r) => r.id === range) ?? HISTORY_RANGES[0];
  const opts = { points: active.points, stepMinutes: active.stepMinutes };

  return {
    provenance: 'demo',
    socSamples: DEMO_SOC_SAMPLES,
    system: {
      current: buildSeries(`${key}:sys-current:${range}`, {
        ...opts,
        base: telemetry.batteryCurrent,
        amplitude: 26,
        decimals: 1,
      }),
      voltage: null,
      powerKw: null,
    },
    racks: [
      {
        name: 'Rack 1',
        current: buildSeries(`${key}:r1-current:${range}`, { ...opts, base: rack1.current, amplitude: 14, decimals: 1 }),
        maxTemperature: buildSeries(`${key}:r1-maxtemp:${range}`, {
          ...opts,
          base: rack1.extremes.maxTemperature.value - 2.5,
          amplitude: 4,
          decimals: 1,
        }),
      },
      {
        name: 'Rack 2',
        current: buildSeries(`${key}:r2-current:${range}`, {
          ...opts,
          base: rack2.current,
          amplitude: 12,
          phase: Math.PI,
          decimals: 1,
        }),
        maxTemperature: buildSeries(`${key}:r2-maxtemp:${range}`, {
          ...opts,
          base: rack2.extremes.maxTemperature.value - 2.5,
          amplitude: 3.4,
          phase: Math.PI / 3,
          decimals: 1,
        }),
      },
    ],
    currentCaption:
      'Total battery current across all racks. Positive values are discharge, negative are charge.',
  };
}

/* --------------------------------------------------------------- Alerts */

function relativeAge(iso: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

export function buildDemoAlerts(deviceId: string): AlertItem[] {
  const telemetry = getSystemTelemetry(seedKey(deviceId));
  const faults: AlertItem[] = telemetry.racks
    .filter((rack) => rack.fault)
    .map((rack) => {
      const fault = rack.fault!;
      return {
        type: fault.severity,
        message: fault.name,
        time: relativeAge(fault.raisedAt),
        source: fault.source,
        code: fault.code,
        detail: fault.detail,
      };
    });

  // Faults first, then warnings, then the informational tail.
  return [
    ...faults.filter((f) => f.type === 'fault'),
    ...faults.filter((f) => f.type === 'warning'),
    ...DEMO_INFO_EVENTS,
  ];
}
