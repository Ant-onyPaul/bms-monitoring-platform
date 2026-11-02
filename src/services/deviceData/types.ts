import type { AlertItem } from '../../components/AlertCard';
import type { BmsCell } from '../../components/bms/CellCard';
import type { BmsSensor } from '../../components/bms/SensorCard';
import type { DeviceSiting } from '../../utils/geofence';
import type {
  BmsFault,
  DailyEnergyPoint,
  OperatingStateCode,
  RackModule,
  RackTelemetry,
  SeriesPoint,
} from '../../types/bms.types';

/* =============================================================================
   Device workspace data contracts

   The device screens render these shapes and nothing else. Two sources fill
   them:

     - liveAdapters.ts — the REST API (device record, telemetry/latest,
       telemetry/history). A field the API does not report is null.
     - demoSource.ts   — the simulation in data/bmsTelemetry.ts, used only when
       the user explicitly opens "Preview layout with demo data". Every result
       is tagged `provenance: 'demo'` and rendered under a SIMULATED banner.

   A view is filled from exactly one source at a time; live and simulated values
   are never mixed on the same screen.
   ========================================================================== */

export type Provenance = 'live' | 'demo';

/** Device workspace sections, in tab order. */
export type SectionId = 'overview' | 'racks' | 'modules' | 'cells' | 'history' | 'alerts';

export interface DataSourceRow {
  label: string;
  status: 'live' | 'demo' | 'unavailable';
  /** Endpoint or field the value is read from, or the one it needs. */
  source: string;
  note?: string;
}

export interface SystemInfoData {
  systemVoltage: number | null;
  /** e.g. "4 racks · 48 modules". Null when the topology is not reported. */
  configuration: string | null;
  ratedKwh: number | null;
  /** Coordinates and geofence; null when the device has no position on record. */
  siting: DeviceSiting | null;
  dataSources: DataSourceRow[];
}

export interface OverviewData {
  provenance: Provenance;
  /** Pack figures. Power is in kW. Null when the source does not report it. */
  readings: {
    voltage: number | null;
    current: number | null;
    powerKw: number | null;
    soc: number | null;
    soh: number | null;
    energyKwh: number | null;
    ratedKwh: number | null;
    cycleCount: number | null;
    /** Single pack temperature, °C — what the API reports today. */
    packTemperature: number | null;
  };
  /** BMS operating state code; null when not reported. */
  state: OperatingStateCode | null;
  /** Active fault: null = reported clear, undefined = health not reported. */
  fault: BmsFault | null | undefined;
  /** Small facts for the status card, already formatted. */
  facts: { label: string; value: string }[];
  /** e.g. "1s interval" or "polled every 3 s". */
  sampleInterval: string;
  streaming: boolean;
  /** Cell temperature spread; null when only a pack temperature exists. */
  cellTemperatures: { max: number; min: number; avg: number; hottestSource: string | null } | null;
  energyToday: { charged: number; discharged: number } | null;
  protection: { contactorClosed: boolean; insulation: number | null } | null;
  trends: {
    soc: SeriesPoint[];
    temperature: SeriesPoint[];
    /** Which temperature the trend carries — the chart is titled from this. */
    temperatureKind: 'max-cell' | 'pack';
    /** Short trailing windows beside the live values. */
    voltage: number[];
    current: number[];
    powerKw: number[];
  };
  dailyEnergy: DailyEnergyPoint[] | null;
  events: AlertItem[] | null;
  system: SystemInfoData;
}

export const HISTORY_RANGES = [
  { id: '24h', label: '24 h', points: 24, stepMinutes: 60 },
  { id: '7d', label: '7 d', points: 28, stepMinutes: 360 },
  { id: '30d', label: '30 d', points: 30, stepMinutes: 1440 },
] as const;

export type HistoryRangeId = (typeof HISTORY_RANGES)[number]['id'];

export interface HistoryData {
  provenance: Provenance;
  /** Raw SOC samples; the view compresses them into stored intervals. */
  socSamples: { timestamp: string; value: number }[];
  system: {
    current: SeriesPoint[];
    voltage: SeriesPoint[] | null;
    powerKw: SeriesPoint[] | null;
  };
  /** Per-rack series; null when the source has no rack-level history. */
  racks: { name: string; current: SeriesPoint[]; maxTemperature: SeriesPoint[] }[] | null;
  /** Sign convention is only stated when the source defines it. */
  currentCaption: string;
}

export interface ModuleDetail {
  cells: BmsCell[];
  sensors: BmsSensor[];
}

export interface RackData {
  racks: RackTelemetry[];
  cellsPerModule: number | null;
  /** Cells and probes for one module of one rack. */
  getModuleDetail: (rack: RackTelemetry, module: RackModule) => ModuleDetail;
}
