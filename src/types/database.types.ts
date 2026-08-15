export type Role = 'admin' | 'vendor' | 'customer';

export interface Vendor {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  vendor_id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  vendor_id: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  customer_id: string;
  device_identifier: string;
  name: string;
  device_type: string | null;
  location: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
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
  status: string | null;
  raw_data: any | null;
  updated_at: string;
}
