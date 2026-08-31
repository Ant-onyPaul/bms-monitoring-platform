/* =============================================================================
   BMS DOMAIN TYPES

   These interfaces describe the telemetry the monitoring screens need. They are
   written to mirror the shape a real backend would return, so that when the
   Supabase schema gains these tables the simulation layer in
   `src/data/bmsTelemetry.ts` can be swapped for a fetch/subscription with no
   change to any component.

   IMPORTANT — provenance
   ----------------------
   Only a handful of these fields exist in the current database schema
   (`DeviceCurrentData` in database.types.ts provides voltage, current, power,
   temperature, humidity, status). Everything else is currently simulated, in
   line with the project's existing mock-telemetry approach. Each field below is
   annotated, and the machine-readable registry lives in
   `TELEMETRY_PROVENANCE` (src/data/bmsTelemetry.ts).
   ========================================================================== */

/**
 * Operating state as reported by the BMS.
 *
 * The wire protocol uses the numeric codes below; the UI must never render the
 * bare number. Use `operatingStateLabel()` to resolve a display string.
 */
export type OperatingStateCode = 0 | 1 | 2;

export const OPERATING_STATE = {
  IDLE: 0,
  CHARGE: 1,
  DISCHARGE: 2,
} as const;

export type OperatingStateLabel = 'Idle' | 'Charging' | 'Discharging';

/** Maps the raw BMS code to the label the company asked to display. */
export function operatingStateLabel(code: OperatingStateCode): OperatingStateLabel {
  switch (code) {
    case OPERATING_STATE.CHARGE:
      return 'Charging';
    case OPERATING_STATE.DISCHARGE:
      return 'Discharging';
    case OPERATING_STATE.IDLE:
    default:
      return 'Idle';
  }
}

/* -----------------------------------------------------------------------------
   Faults

   A fault must always carry a name. The UI is forbidden from rendering a bare
   "FAULT" chip, so this type makes `name` non-optional — a fault without a
   description cannot be constructed.
   -------------------------------------------------------------------------- */

export interface BmsFault {
  /** Manufacturer fault code, e.g. "UV-2101". */
  code: string;
  /** Human-readable fault name, e.g. "Cell Under Voltage". */
  name: string;
  /** Where the fault was raised. */
  source: string;
  severity: 'warning' | 'fault';
  /** ISO timestamp the fault was first latched. */
  raisedAt: string;
  /** Optional engineer-facing explanation. */
  detail?: string;
}

/* -----------------------------------------------------------------------------
   Cell / module addressing

   Every extreme reading must be locatable. `module` and `cell` are 1-indexed to
   match the labelling used on physical hardware.
   -------------------------------------------------------------------------- */

export interface CellReading {
  value: number;
  /** 1-indexed module position within the rack. */
  module: number;
  /** 1-indexed cell position within the module. */
  cell: number;
}

/**
 * The eight extremes the company asked for on the rack diagnostics screen.
 * Voltage in mV, SOC/SOH in %, temperature in °C.
 */
export interface RackExtremes {
  minCellVoltage: CellReading;
  maxCellVoltage: CellReading;
  minCellSoc: CellReading;
  maxCellSoc: CellReading;
  minCellSoh: CellReading;
  maxCellSoh: CellReading;
  minTemperature: CellReading;
  maxTemperature: CellReading;
}

/* -----------------------------------------------------------------------------
   Rack
   -------------------------------------------------------------------------- */

export interface RackTelemetry {
  id: string;
  name: string;

  /** Rack terminal voltage, V. Series sum of module voltages. */
  voltage: number;
  /** Rack current, A. Positive = discharge, negative = charge. */
  current: number;
  /** Rack power, kW. Derived: voltage x current. */
  power: number;
  /** Rack state of charge, %. */
  soc: number;
  /** Rack state of health, %. */
  soh: number;
  /** Equivalent full cycles completed. */
  cycleCount: number;
  /** Energy charged into the rack since local midnight, kWh. */
  dailyChargedKwh: number;
  /** Energy discharged from the rack since local midnight, kWh. */
  dailyDischargedKwh: number;

  /** Voltage measured at the rack output, after the contactor. V. */
  outputVoltage: number;
  /** Raw BMS state code. Render via operatingStateLabel(). */
  state: OperatingStateCode;
  /** Null when the rack is healthy. */
  fault: BmsFault | null;
  /** Main contactor position. */
  contactorClosed: boolean;

  extremes: RackExtremes;
  modules: RackModule[];
}

export interface RackModule {
  id: string;
  /** 1-indexed position within the rack. */
  position: number;
  name: string;
  voltage: number;
  temperature: number;
  soc: number;
  soh: number;
  communication: 'Active' | 'Inactive';
  health: 'Healthy' | 'Warning' | 'Fault' | 'Offline';
  /** Widest cell-voltage spread inside this module, V. Null when nominal. */
  deltaV: number | null;
}

/* -----------------------------------------------------------------------------
   System (device) level
   -------------------------------------------------------------------------- */

export interface SystemTelemetry {
  /** Battery terminal voltage, V. Backend field: device_current_data.voltage */
  batteryVoltage: number;
  /** Battery current, A. Backend field: device_current_data.current */
  batteryCurrent: number;
  /** Battery power, kW. Backend field: device_current_data.power */
  batteryPower: number;

  /** Usable energy currently stored, kWh. NO BACKEND FIELD. */
  batteryEnergyKwh: number;
  /** Nameplate usable capacity, kWh. NO BACKEND FIELD. */
  ratedEnergyKwh: number;
  /** State of charge, %. NO BACKEND FIELD. */
  soc: number;
  /** State of health, %. NO BACKEND FIELD. */
  soh: number;

  /** Energy charged since local midnight, kWh. NO BACKEND FIELD. */
  dailyChargedKwh: number;
  /** Energy discharged since local midnight, kWh. NO BACKEND FIELD. */
  dailyDischargedKwh: number;

  /** Raw BMS state code. NO BACKEND FIELD — currently derived from current sign. */
  state: OperatingStateCode;

  /** Hottest cell across the whole system, °C. */
  maxCellTemperature: number;
  /** Coldest cell across the whole system, °C. */
  minCellTemperature: number;

  cycleCount: number;

  /** Highest-severity active fault, or null. NO BACKEND FIELD. */
  fault: BmsFault | null;

  racks: RackTelemetry[];
}

/* -----------------------------------------------------------------------------
   Time series
   -------------------------------------------------------------------------- */

export interface SeriesPoint {
  /** Epoch milliseconds. */
  t: number;
  /** Pre-formatted axis label. */
  label: string;
  value: number;
}

export interface DailyEnergyPoint {
  /** Epoch milliseconds at local midnight. */
  t: number;
  /** Short date label, e.g. "24 Aug". */
  label: string;
  chargedKwh: number;
  dischargedKwh: number;
}

/* -----------------------------------------------------------------------------
   Provenance

   Describes where each displayed metric comes from, so the UI can be explicit
   about what is real and what is awaiting a backend field.
   -------------------------------------------------------------------------- */

export type Provenance =
  /** Backed by a column that exists in the current schema. */
  | 'mapped'
  /** Computed from fields that exist. */
  | 'derived'
  /** No backend field yet — simulated, consistent with the project's mock data. */
  | 'simulated';

export interface FieldProvenance {
  /** Metric name as shown in the UI. */
  label: string;
  provenance: Provenance;
  /** Backend column or table this should bind to. */
  backingField: string;
  note?: string;
}
