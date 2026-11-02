import type { DeviceCurrentData, TelemetryPoint } from '../../types/database.types';
import type { SeriesPoint } from '../../types/bms.types';
import type { DataSourceRow, HistoryData, OverviewData, SectionId } from './types.ts';

/* =============================================================================
   Live adapters

   Pure mappings from the REST API's responses to the workspace shapes. They
   never fill a gap: a reading the device did not send stays null, a section the
   API does not serve is reported as unavailable. Network calls live in
   apiSource.ts; keeping these pure lets them be unit-tested without a backend.
   ========================================================================== */

/** A device that has not reported for this long is shown as not streaming. */
export const STALE_MS = 30_000;

/** How often the page polls telemetry/latest (see useDeviceRealtime). */
export const LIVE_SAMPLE_LABEL = 'polled every 3 s';

/** telemetry/latest and /history report power in watts; the views show kW. */
export function toKw(watts: number | null | undefined): number | null {
  const value = finite(watts);
  return value === null ? null : value / 1000;
}

function finite(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function isStreaming(live: DeviceCurrentData | null, now: number): boolean {
  if (!live) return false;
  const at = Date.parse(live.received_at);
  return Number.isFinite(at) && now - at < STALE_MS;
}

/** Oldest first, dropping rows without a parseable timestamp. */
export function sortHistory(rows: readonly TelemetryPoint[]): TelemetryPoint[] {
  return rows
    .filter((r) => Number.isFinite(Date.parse(r.received_at)))
    .slice()
    .sort((a, b) => Date.parse(a.received_at) - Date.parse(b.received_at));
}

type Reading = Exclude<keyof TelemetryPoint, 'received_at'>;

/** One reading as a chart series. Rows where the device sent no value are skipped, not zeroed. */
export function seriesFrom(
  rows: readonly TelemetryPoint[],
  key: Reading,
  formatTime: (iso: string) => string,
  transform: (value: number) => number = (v) => v,
): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  for (const row of rows) {
    const value = finite(row[key]);
    if (value === null) continue;
    points.push({ t: Date.parse(row.received_at), label: formatTime(row.received_at), value: transform(value) });
  }
  return points;
}

const TRAILING = 8;
const tail = (series: SeriesPoint[]) => series.slice(-TRAILING).map((p) => p.value);

export interface LiveOverviewInput {
  live: DeviceCurrentData | null;
  history: readonly TelemetryPoint[];
  now: number;
  formatAge: (iso: string | null) => string;
  formatTime: (iso: string) => string;
}

export function buildLiveOverview({ live, history, now, formatAge, formatTime }: LiveOverviewInput): OverviewData {
  const rows = sortHistory(history);
  const soc = seriesFrom(rows, 'soc', formatTime);
  const temperature = seriesFrom(rows, 'temperature', formatTime);
  const voltage = seriesFrom(rows, 'voltage', formatTime);
  const current = seriesFrom(rows, 'current', formatTime);
  const powerKw = seriesFrom(rows, 'power', formatTime, (w) => w / 1000);

  return {
    provenance: 'live',
    readings: {
      voltage: finite(live?.voltage),
      current: finite(live?.current),
      powerKw: toKw(live?.power),
      soc: finite(live?.soc),
      soh: finite(live?.soh),
      energyKwh: null,
      ratedKwh: null,
      cycleCount: null,
      packTemperature: finite(live?.temperature),
    },
    state: null,
    fault: undefined,
    facts: [
      { label: 'Last message', value: formatAge(live?.received_at ?? null) },
      { label: 'Stored samples', value: String(rows.length) },
    ],
    sampleInterval: LIVE_SAMPLE_LABEL,
    streaming: isStreaming(live, now),
    cellTemperatures: null,
    energyToday: null,
    protection: null,
    trends: {
      soc,
      temperature,
      temperatureKind: 'pack',
      voltage: tail(voltage),
      current: tail(current),
      powerKw: tail(powerKw),
    },
    dailyEnergy: null,
    events: null,
    system: {
      systemVoltage: finite(live?.voltage),
      configuration: null,
      ratedKwh: null,
      siting: null,
      dataSources: LIVE_DATA_SOURCES,
    },
  };
}

export function buildLiveHistory(
  history: readonly TelemetryPoint[],
  formatTime: (iso: string) => string,
): HistoryData {
  const rows = sortHistory(history);
  return {
    provenance: 'live',
    socSamples: rows
      .filter((r) => finite(r.soc) !== null)
      .map((r) => ({ timestamp: r.received_at, value: r.soc as number })),
    system: {
      current: seriesFrom(rows, 'current', formatTime),
      voltage: seriesFrom(rows, 'voltage', formatTime),
      powerKw: seriesFrom(rows, 'power', formatTime, (w) => w / 1000),
    },
    racks: null,
    currentCaption:
      'Battery current as reported in each telemetry message. The charge/discharge sign follows the BMS firmware.',
  };
}

/* -----------------------------------------------------------------------------
   What the API serves today
   -------------------------------------------------------------------------- */

/** Sections with any live data. The rest render an empty state until the API adds them. */
export const LIVE_SECTIONS: Record<SectionId, boolean> = {
  overview: true,
  history: true,
  racks: false,
  modules: false,
  cells: false,
  alerts: false,
};

/** What each unavailable section needs from the backend. Endpoint names are proposals. */
export const BACKEND_REQUIREMENTS: Record<'racks' | 'modules' | 'cells' | 'alerts', { endpoint: string; fields: string }> = {
  racks: {
    endpoint: 'GET /api/devices/:id/racks',
    fields:
      'Per rack: voltage, current, power, SOC, SOH, cycle count, daily charged/discharged energy, output voltage, BMS state code, contactor position, active fault, and min/max cell voltage, SOC, SOH and temperature with their module and cell positions.',
  },
  modules: {
    endpoint: 'GET /api/devices/:id/racks (modules[] per rack)',
    fields: 'Per module: position and name, so the module navigator can list them and open their cells.',
  },
  cells: {
    endpoint: 'GET /api/devices/:id/racks/:rack/modules/:module/cells',
    fields: 'Per cell: voltage (mV) and balancing state. Per module: NTC probe temperatures.',
  },
  alerts: {
    endpoint: 'GET /api/devices/:id/alerts',
    fields: 'Per event: type (fault, warning, info), name, code, source, raised-at time and detail.',
  },
};

export const LIVE_DATA_SOURCES: DataSourceRow[] = [
  { label: 'Pack voltage, current, power', status: 'live', source: 'GET /api/devices/:id/telemetry/latest' },
  { label: 'State of charge, state of health', status: 'live', source: 'GET /api/devices/:id/telemetry/latest' },
  { label: 'Pack temperature', status: 'live', source: 'GET /api/devices/:id/telemetry/latest' },
  { label: 'Trends and stored intervals', status: 'live', source: 'GET /api/devices/:id/telemetry/history' },
  { label: 'Name, IMEI, customer, location text', status: 'live', source: 'GET /api/devices/:id' },
  {
    label: 'Battery energy, rated capacity, cycle count',
    status: 'unavailable',
    source: 'telemetry/latest: energy_kwh, rated_kwh, cycle_count',
  },
  { label: 'Operating state', status: 'unavailable', source: 'telemetry/latest: BMS state code' },
  { label: 'Cell temperature spread', status: 'unavailable', source: BACKEND_REQUIREMENTS.racks.endpoint },
  { label: 'Daily charged / discharged energy', status: 'unavailable', source: 'GET /api/devices/:id/energy/daily' },
  { label: 'Protection and contactor state', status: 'unavailable', source: BACKEND_REQUIREMENTS.racks.endpoint },
  { label: 'Racks, modules, cells', status: 'unavailable', source: BACKEND_REQUIREMENTS.racks.endpoint },
  { label: 'Alerts and events', status: 'unavailable', source: BACKEND_REQUIREMENTS.alerts.endpoint },
  {
    label: 'Coordinates and geofence',
    status: 'unavailable',
    source: 'devices.latitude, devices.longitude, geofence',
  },
];
