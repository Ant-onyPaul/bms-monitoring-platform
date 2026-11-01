import { post } from './api';
import type { OnboardField } from '../components/OnboardModal';
import { Customer, Device, IssuedCredentials, Vendor } from '../types/database.types';

/* Field sets and create calls shared by every page that onboards something.
   Who may call each endpoint is enforced by the API, not by these helpers. */

export const VENDOR_FIELDS: OnboardField[] = [
  { id: 'name', label: 'Vendor name', required: true, maxLength: 120 },
  { id: 'email', label: 'Login email', type: 'email', inputMode: 'email', required: true },
];

export const CUSTOMER_FIELDS: OnboardField[] = [
  { id: 'name', label: 'Customer name', required: true, maxLength: 120 },
  { id: 'email', label: 'Login email', type: 'email', inputMode: 'email', required: true },
];

export const DEVICE_FIELDS: OnboardField[] = [
  { id: 'name', label: 'Device name', required: true, maxLength: 120 },
  { id: 'imei', label: 'LTE module IMEI (15 digits)', inputMode: 'numeric', required: true, maxLength: 15 },
  { id: 'location', label: 'Site / location', maxLength: 120 },
  { id: 'device_type', label: 'Device type', maxLength: 120 },
];

export const createVendor = (values: Record<string, string>) =>
  post<{ vendor: Vendor; credentials: IssuedCredentials }>('/api/vendors', values);

export const createCustomer = (values: Record<string, string>, vendorId: string | null) =>
  post<{ customer: Customer; credentials: IssuedCredentials }>('/api/customers', { ...values, vendor_id: vendorId });

export const createDevice = (values: Record<string, string>, customerId: string | null) =>
  post<Device>('/api/devices', { ...values, customer_id: customerId });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
