export type Role = 'admin' | 'vendor' | 'customer';

export interface Vendor {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  contact_email: string | null;
  customer_count: number;
  device_count: number;
  created_at: string;
}

export interface Customer {
  id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_code: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  contact_email: string | null;
  device_count: number;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  vendor_id: string | null;
  customer_id: string | null;
  must_change_password: boolean;
}

/** One-time login issued when a vendor or customer is onboarded. */
export interface IssuedCredentials {
  email: string;
  temporary_password: string;
  /** True when the API also emailed these details to the account holder. */
  email_sent?: boolean;
}

export interface Device {
  id: string;
  customer_id: string;
  customer_name?: string;
  vendor_id?: string;
  device_identifier: string;
  imei?: string;
  name: string;
  device_type: string | null;
  location: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  last_seen_at: string | null;
  created_at: string;
}

/** /api/overview — figures scoped to whatever the signed-in user can see. */
export interface Overview {
  counts: {
    vendors?: number;
    customers: number;
    devices: number;
    online: number;
    never_reported: number;
    attention: number;
    last_ingest_at: string | null;
  };
  /** Averages over devices reporting right now; all null when none are. */
  fleet: {
    avg_soc: number | null;
    avg_soh: number | null;
    total_current: number | null;
    max_temperature: number | null;
    warmest_device: string | null;
  };
  availability:{ day: string; registered: number; reported: number }[];
  activity: {
    kind: 'vendor' | 'customer' | 'device';
    name: string;
    at: string;
    actor: string | null;
    customer_name?: string;
    imei?: string;
  }[];
  alerts: {
    type: 'fault' | 'warning' | 'info';
    message: string;
    at: string;
    source: string;
    code: string;
    detail: string;
  }[];
}

/** One row of /telemetry/history. Fields the device did not send are null. */
export interface TelemetryPoint {
  received_at: string;
  voltage: number | null;
  current: number | null;
  power: number | null;
  soc: number | null;
  soh: number | null;
  temperature: number | null;
}

export interface DeviceCurrentData {
  id: string;
  device_id: string;
  received_at: string;
  temperature: number | null;
  humidity: number | null;
  voltage: number | null;
  current: number | null;
  power: number | null;
  soc?: number | null;
  soh?: number | null;
  status: string | null;
  raw_data: any | null;
  updated_at: string;
}
