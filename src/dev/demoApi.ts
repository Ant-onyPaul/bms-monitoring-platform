import type {
  Customer,
  Device,
  DeviceCurrentData,
  IssuedCredentials,
  Overview,
  Profile,
  TelemetryPoint,
  Vendor,
} from '../types/database.types';

/* =============================================================================
   Dev demo API — a SIMULATED stand-in for the REST backend.

   DEVELOPMENT ONLY. Loaded by src/main.tsx solely under `vite` dev with
   VITE_DEV_DEMO_BACKEND=true (see demoBackend.ts for every guard). It lets the
   frontend be inspected without the real backend, by answering the same
   endpoints the app already calls — so the real auth, routing and API client
   run unmodified against it.

   Nothing here is real. The organisations and devices reuse the sample names
   from the original UI (Vendor A, Main HQ Battery, …) so the demo looks like
   it; every reading is generated from the clock; IMEIs are DEMO-IMEI-nnnn; and
   a permanent SIMULATED ribbon is shown on every page while this is active.
   Created records live in memory until reload.
   ========================================================================== */

export interface DemoRequest {
  method: string;
  path: string;
  query: URLSearchParams;
  authorization: string | null;
  body: unknown;
}

export interface DemoResponse {
  status: number;
  body: unknown;
}

export const DEMO_TOKEN_PREFIX = 'dev-demo-token:';
export const DEMO_PASSWORD_NOTICE = 'demo-only-not-a-real-password';

export const DEMO_ACCOUNTS = [
  'demo-admin@shade.test',
  'demo-vendor@shade.test',
  'demo-customer@shade.test',
] as const;

const HISTORY_STEP_MS = 10_000;
const MAX_HISTORY = 500;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type Body = Record<string, unknown>;

const ok = (body: unknown, status = 200): DemoResponse => ({ status, body });
const fail = (status: number, error: string): DemoResponse => ({ status, body: { error } });
const str = (body: unknown, key: string) => {
  const value = (body as Body | null)?.[key];
  return typeof value === 'string' ? value.trim() : '';
};
const round = (value: number, digits: number) => Number(value.toFixed(digits));

/* ---------------------------------------------------------------- Signals
   Smooth, clock-driven waveforms so values move on each poll and trends have
   shape. Each device gets its own phase and baseline; deterministic for a given
   time, so tests can pin them. */

interface SignalProfile {
  phase: number;
  socBase: number;
  sohBase: number;
  tempBase: number;
}

function signals(at: number, p: SignalProfile) {
  const s = at / 1000 + p.phase;
  const voltage = 51.2 + 0.6 * Math.sin(s / 300);
  const current = 18 * Math.sin(s / 420);
  return {
    soc: round(Math.min(100, Math.max(0, p.socBase + 6 * Math.sin(s / 900))), 1),
    soh: p.sohBase,
    voltage: round(voltage, 2),
    current: round(current, 2),
    power: round(voltage * current, 0),
    temperature: round(p.tempBase + 1.8 * Math.sin(s / 600 + 1), 1),
  };
}

/* ---------------------------------------------------------------- Dataset */

type Reporting =
  | { kind: 'streaming' }
  | { kind: 'offline'; sinceMs: number }
  | { kind: 'never' };

interface DemoDevice extends Device {
  reporting: Reporting;
  signal: SignalProfile;
}

interface Seed {
  id: string;
  customer: string;
  identifier: string;
  imei: string;
  name: string;
  type: string;
  location: string;
  ageDays: number;
  reporting: Reporting;
  signal: SignalProfile;
}

const VENDOR_SEED = [
  { id: 'vendor-a', name: 'Vendor A', code: 'VEN-A', status: 'active', email: 'demo-vendor@shade.test', ageDays: 210 },
  { id: 'vendor-b', name: 'Vendor B', code: 'VEN-B', status: 'active', email: 'operations@vendor-b.example.com', ageDays: 160 },
  { id: 'vendor-c', name: 'Vendor C', code: 'VEN-C', status: 'inactive', email: 'hello@vendor-c.example.com', ageDays: 9 },
] as const;

const CUSTOMER_SEED = [
  { id: 'customer-a1', vendor: 'vendor-a', name: 'Customer A1', code: 'CUST-A1', status: 'active', email: 'demo-customer@shade.test', ageDays: 190 },
  { id: 'customer-a2', vendor: 'vendor-a', name: 'Customer A2', code: 'CUST-A2', status: 'active', email: 'facilities@customer-a2.example.com', ageDays: 120 },
  { id: 'customer-b1', vendor: 'vendor-b', name: 'Customer B1', code: 'CUST-B1', status: 'active', email: 'energy@customer-b1.example.com', ageDays: 140 },
  { id: 'customer-b2', vendor: 'vendor-b', name: 'Customer B2', code: 'CUST-B2', status: 'active', email: 'site-ops@customer-b2.example.com', ageDays: 75 },
  { id: 'customer-c1', vendor: 'vendor-c', name: 'Customer C1', code: 'CUST-C1', status: 'inactive', email: 'pilot@customer-c1.example.com', ageDays: 6 },
] as const;

const DEVICE_SEED: Seed[] = [
  { id: 'dev-a001', customer: 'customer-a1', identifier: 'BMS-A001', imei: 'DEMO-IMEI-0001', name: 'Main HQ Battery', type: 'BMS V1', location: 'New York', ageDays: 180, reporting: { kind: 'streaming' }, signal: { phase: 0, socBase: 74, sohBase: 96.4, tempBase: 27 } },
  { id: 'dev-a002', customer: 'customer-a2', identifier: 'BMS-A002', imei: 'DEMO-IMEI-0002', name: 'Branch 1 Backup', type: 'BMS V2', location: 'Boston', ageDays: 110, reporting: { kind: 'offline', sinceMs: HOUR }, signal: { phase: 900, socBase: 58, sohBase: 93.8, tempBase: 25 } },
  { id: 'dev-a003', customer: 'customer-a1', identifier: 'BMS-A003', imei: 'DEMO-IMEI-0003', name: 'Warehouse East Storage', type: 'BMS V2', location: 'Newark', ageDays: 64, reporting: { kind: 'streaming' }, signal: { phase: 1700, socBase: 66, sohBase: 98.1, tempBase: 29 } },
  { id: 'dev-b001', customer: 'customer-b1', identifier: 'BMS-B001', imei: 'DEMO-IMEI-0004', name: 'Plant 3 Peak Shaver', type: 'BMS V2', location: 'Chicago', ageDays: 132, reporting: { kind: 'streaming' }, signal: { phase: 2600, socBase: 81, sohBase: 95.2, tempBase: 30 } },
  { id: 'dev-b002', customer: 'customer-b1', identifier: 'BMS-B002', imei: 'DEMO-IMEI-0005', name: 'Cold Store Backup', type: 'BMS V1', location: 'Milwaukee', ageDays: 98, reporting: { kind: 'streaming' }, signal: { phase: 3300, socBase: 47, sohBase: 91.7, tempBase: 43 } },
  { id: 'dev-b003', customer: 'customer-b2', identifier: 'BMS-B003', imei: 'DEMO-IMEI-0006', name: 'Solar Farm Buffer', type: 'BMS V2', location: 'Denver', ageDays: 70, reporting: { kind: 'offline', sinceMs: 6 * HOUR }, signal: { phase: 4100, socBase: 88, sohBase: 97.3, tempBase: 24 } },
  { id: 'dev-b004', customer: 'customer-b2', identifier: 'BMS-B004', imei: 'DEMO-IMEI-0007', name: 'Depot Charging Hub', type: 'BMS V2', location: 'Austin', ageDays: 41, reporting: { kind: 'streaming' }, signal: { phase: 5000, socBase: 62, sohBase: 99.0, tempBase: 33 } },
  { id: 'dev-c001', customer: 'customer-c1', identifier: 'BMS-C001', imei: 'DEMO-IMEI-0008', name: 'Pilot Site Unit', type: 'BMS V2', location: 'Seattle', ageDays: 5, reporting: { kind: 'never' }, signal: { phase: 0, socBase: 0, sohBase: 0, tempBase: 0 } },
];

/** Pack temperature at which a device raises the demo's high-temperature warning. */
const HOT_C = 40;

/** Devices missing from the fleet on each of the last 14 days, oldest first. */
const DAILY_GAPS = [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2];

/* ---------------------------------------------------------------- Server */

export function createDemoApi(clock: () => number = () => Date.now()) {
  const ago = (ms: number) => new Date(clock() - ms).toISOString();

  const vendors: Vendor[] = VENDOR_SEED.map((v) => ({
    id: v.id,
    name: v.name,
    code: v.code,
    status: v.status,
    contact_email: v.email,
    customer_count: 0,
    device_count: 0,
    created_at: ago(v.ageDays * DAY),
  }));

  const vendorOf = (id: string) => vendors.find((v) => v.id === id)!;

  const customers: Customer[] = CUSTOMER_SEED.map((c) => ({
    id: c.id,
    vendor_id: c.vendor,
    vendor_name: vendorOf(c.vendor).name,
    vendor_code: vendorOf(c.vendor).code,
    name: c.name,
    code: c.code,
    status: c.status,
    contact_email: c.email,
    device_count: 0,
    created_at: ago(c.ageDays * DAY),
  }));

  const customerOf = (id: string) => customers.find((c) => c.id === id)!;

  const devices: DemoDevice[] = DEVICE_SEED.map((d) => ({
    id: d.id,
    customer_id: d.customer,
    customer_name: customerOf(d.customer).name,
    vendor_id: customerOf(d.customer).vendor_id,
    device_identifier: d.identifier,
    imei: d.imei,
    name: d.name,
    device_type: d.type,
    location: d.location,
    status: 'active',
    last_seen_at: null,
    created_at: ago(d.ageDays * DAY),
    reporting: d.reporting,
    signal: d.signal,
  }));

  const profiles: Profile[] = [
    { id: 'demo-user-admin', full_name: 'Demo Admin', email: DEMO_ACCOUNTS[0], role: 'admin', vendor_id: null, customer_id: null, must_change_password: false },
    { id: 'demo-user-vendor', full_name: 'Demo Vendor', email: DEMO_ACCOUNTS[1], role: 'vendor', vendor_id: 'vendor-a', customer_id: null, must_change_password: false },
    { id: 'demo-user-customer', full_name: 'Demo Customer', email: DEMO_ACCOUNTS[2], role: 'customer', vendor_id: null, customer_id: 'customer-a1', must_change_password: false },
  ];

  /* Onboarding events for the activity feed, newest first. */
  const activity: (Overview['activity'][number] & { vendor_id: string | null; customer_id: string | null })[] = [
    ...vendors.map((v) => ({ kind: 'vendor' as const, name: v.name, at: v.created_at, actor: 'Demo Admin', vendor_id: v.id, customer_id: null })),
    ...customers.map((c) => ({ kind: 'customer' as const, name: c.name, at: c.created_at, actor: c.vendor_id === 'vendor-a' ? 'Demo Vendor' : `${c.vendor_name} team`, vendor_id: c.vendor_id, customer_id: c.id })),
    ...devices.map((d) => ({ kind: 'device' as const, name: d.name, at: d.created_at, actor: d.customer_name ?? null, customer_name: d.customer_name, imei: d.imei, vendor_id: d.vendor_id ?? null, customer_id: d.customer_id })),
  ];

  let sequence = 0;
  const nextId = (kind: string) => `${kind}-new-${++sequence}`;

  /* ------------------------------------------------------------ Helpers */

  /** Latest message time: on a 3 s grid, half a second old, like a device on a 3 s cadence. */
  const latestAt = () => {
    const now = clock();
    return now - (now % 3000) - 500;
  };

  /** When the device last reported, or null if it never has. */
  function lastReportAt(d: DemoDevice): number | null {
    if (d.reporting.kind === 'streaming') return latestAt();
    if (d.reporting.kind === 'offline') {
      const at = clock() - d.reporting.sinceMs;
      return at - (at % MINUTE);
    }
    return null;
  }

  const publicDevice = (d: DemoDevice): Device => {
    const { reporting: _reporting, signal: _signal, ...rest } = d;
    const at = lastReportAt(d);
    return { ...rest, last_seen_at: at === null ? null : new Date(at).toISOString() };
  };

  const withCounts = (v: Vendor): Vendor => ({
    ...v,
    customer_count: customers.filter((c) => c.vendor_id === v.id).length,
    device_count: devices.filter((d) => d.vendor_id === v.id).length,
  });

  const withDeviceCount = (c: Customer): Customer => ({
    ...c,
    device_count: devices.filter((d) => d.customer_id === c.id).length,
  });

  const visibleDevices = (p: Profile) =>
    devices.filter(
      (d) =>
        p.role === 'admin' ||
        (p.role === 'vendor' && d.vendor_id === p.vendor_id) ||
        (p.role === 'customer' && d.customer_id === p.customer_id),
    );

  const visibleCustomers = (p: Profile) =>
    customers.filter(
      (c) =>
        p.role === 'admin' ||
        (p.role === 'vendor' && c.vendor_id === p.vendor_id) ||
        (p.role === 'customer' && c.id === p.customer_id),
    );

  const authResult = (p: Profile) => ({ access_token: `${DEMO_TOKEN_PREFIX}${p.id}`, profile: p });

  const issue = (email: string): IssuedCredentials => ({
    email,
    temporary_password: DEMO_PASSWORD_NOTICE,
    email_sent: false,
  });

  function caller(authorization: string | null): Profile | null {
    const token = authorization?.replace(/^Bearer\s+/i, '') ?? '';
    if (!token.startsWith(DEMO_TOKEN_PREFIX)) return null;
    return profiles.find((p) => p.id === token.slice(DEMO_TOKEN_PREFIX.length)) ?? null;
  }

  function latest(device: DemoDevice): DeviceCurrentData | null {
    const at = lastReportAt(device);
    if (at === null) return null;
    const receivedAt = new Date(at).toISOString();
    return {
      id: `${device.id}-latest`,
      device_id: device.id,
      received_at: receivedAt,
      ...signals(at, device.signal),
      humidity: null,
      status: null,
      raw_data: { test_only: true, source: 'dev-demo-backend' },
      updated_at: receivedAt,
    };
  }

  function history(device: DemoDevice, limit: number): TelemetryPoint[] {
    const newest = lastReportAt(device);
    if (newest === null) return [];
    return Array.from({ length: limit }, (_, i) => {
      const at = newest - (limit - 1 - i) * HISTORY_STEP_MS;
      return { received_at: new Date(at).toISOString(), ...signals(at, device.signal) };
    });
  }

  function alertsFor(scoped: DemoDevice[]): Overview['alerts'] {
    const alerts: Overview['alerts'] = [];
    for (const d of scoped) {
      const source = `${d.customer_name} · ${d.device_identifier}`;
      const reading = latest(d);
      if (d.reporting.kind === 'offline') {
        alerts.push({
          type: 'fault',
          message: `Offline device detected: ${d.name}`,
          at: new Date(lastReportAt(d)!).toISOString(),
          source,
          code: 'LINK-4004',
          detail: 'No telemetry frames received since the last message. The gateway may have lost its LTE link.',
        });
      } else if (d.reporting.kind === 'never') {
        alerts.push({
          type: 'warning',
          message: `${d.name} has not reported since registration`,
          at: d.created_at,
          source,
          code: 'LINK-0000',
          detail: 'The device is registered but no MQTT message has been received for its IMEI yet.',
        });
      } else if (reading && (reading.temperature ?? 0) >= HOT_C) {
        alerts.push({
          type: 'warning',
          message: `High temperature on ${d.name}`,
          at: reading.received_at,
          source,
          code: 'OT-1140',
          detail: `Pack temperature is ${reading.temperature} °C, above the ${HOT_C} °C warning threshold.`,
        });
      }
    }
    if (scoped.length > 1) {
      alerts.push({
        type: 'info',
        message: `Firmware updated on ${Math.min(3, scoped.length)} devices`,
        at: ago(26 * HOUR),
        source: 'Fleet · scheduled window',
        code: 'FW-2143',
        detail: 'Controller v2.14.3 rolled out during the maintenance window. No rollbacks reported.',
      });
    }
    return alerts;
  }

  function overview(p: Profile): Overview {
    const scoped = visibleDevices(p);
    const live = scoped
      .filter((d) => d.reporting.kind === 'streaming')
      .map((d) => ({ device: d, reading: latest(d)! }));
    const avg = (pick: (r: DeviceCurrentData) => number | null | undefined) =>
      live.length ? round(live.reduce((n, { reading }) => n + (pick(reading) ?? 0), 0) / live.length, 1) : null;
    const warmest = live.reduce<(typeof live)[number] | null>(
      (best, entry) => (!best || (entry.reading.temperature ?? 0) > (best.reading.temperature ?? 0) ? entry : best),
      null,
    );
    const alerts = alertsFor(scoped);

    const visibleActivity = activity
      .filter(
        (a) =>
          p.role === 'admin' ||
          (p.role === 'vendor' && a.vendor_id === p.vendor_id && a.kind !== 'vendor') ||
          (p.role === 'customer' && a.customer_id === p.customer_id && a.kind === 'device'),
      )
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
      .slice(0, 8)
      .map(({ vendor_id: _v, customer_id: _c, ...entry }) => entry);

    return {
      counts: {
        ...(p.role === 'admin' ? { vendors: vendors.length } : {}),
        customers: visibleCustomers(p).length,
        devices: scoped.length,
        online: live.length,
        never_reported: scoped.filter((d) => d.reporting.kind === 'never').length,
        attention: alerts.filter((a) => a.type === 'warning').length,
        last_ingest_at: live[0]?.reading.received_at ?? null,
      },
      fleet: {
        avg_soc: avg((r) => r.soc),
        avg_soh: avg((r) => r.soh),
        total_current: live.length ? round(live.reduce((n, { reading }) => n + (reading.current ?? 0), 0), 1) : null,
        max_temperature: warmest?.reading.temperature ?? null,
        warmest_device: warmest?.device.name ?? null,
      },
      availability: DAILY_GAPS.map((gap, i) => {
        const dayStart = clock() - (DAILY_GAPS.length - 1 - i) * DAY;
        const registered = scoped.filter((d) => Date.parse(d.created_at) <= dayStart).length;
        return {
          day: new Date(dayStart).toISOString().slice(0, 10),
          registered,
          reported: Math.max(0, registered - Math.min(gap, registered)),
        };
      }),
      activity: visibleActivity,
      alerts,
    };
  }

  /* ------------------------------------------------------------ Routes */

  function handle(req: DemoRequest): DemoResponse {
    const method = req.method.toUpperCase();
    const parts = req.path.replace(/\/+$/, '').split('/').filter(Boolean); // ['api', ...]
    if (parts[0] !== 'api') return fail(404, 'Not found');
    const [, resource, id, sub, leaf] = parts;

    if (method === 'GET' && resource === 'health') return ok({ ok: true, demo: true });

    if (method === 'POST' && resource === 'auth' && id === 'login') {
      const email = str(req.body, 'email').toLowerCase();
      const password = str(req.body, 'password');
      const profile = profiles.find((p) => p.email === email);
      if (!profile || !password) {
        return fail(401, `Dev demo backend: sign in as ${DEMO_ACCOUNTS.join(', ')} with any password.`);
      }
      return ok(authResult(profile));
    }

    const me = caller(req.authorization);
    if (!me) return fail(401, 'Session expired or invalid');

    if (resource === 'auth') {
      if (method === 'GET' && id === 'me') return ok(me);
      if (method === 'POST' && id === 'change-password') {
        if (str(req.body, 'new_password').length < 10) return fail(400, 'Use at least 10 characters.');
        me.must_change_password = false;
        return ok(authResult(me));
      }
    }

    if (method === 'GET' && resource === 'overview') return ok(overview(me));

    /* -------------------------------------------------------- Vendors */
    if (resource === 'vendors') {
      if (me.role !== 'admin') return fail(403, 'Only administrators can manage vendors.');
      if (method === 'GET' && !id) return ok(vendors.map(withCounts));
      if (method === 'GET' && id) {
        const vendor = vendors.find((v) => v.id === id);
        return vendor ? ok(withCounts(vendor)) : fail(404, 'Vendor not found');
      }
      if (method === 'POST' && !id) {
        const name = str(req.body, 'name');
        const email = str(req.body, 'email').toLowerCase();
        if (!name || !email) return fail(400, 'Name and email are required.');
        if (profiles.some((p) => p.email === email) || vendors.some((v) => v.contact_email === email)) {
          return fail(409, 'That email already has an account.');
        }
        const vendor: Vendor = {
          id: nextId('vendor'),
          name,
          code: `VEN-${String(vendors.length + 1).padStart(2, '0')}`,
          status: 'active',
          contact_email: email,
          customer_count: 0,
          device_count: 0,
          created_at: new Date(clock()).toISOString(),
        };
        vendors.unshift(vendor);
        activity.push({ kind: 'vendor', name, at: vendor.created_at, actor: me.full_name, vendor_id: vendor.id, customer_id: null });
        return ok({ vendor, credentials: issue(email) }, 201);
      }
    }

    /* ------------------------------------------------------ Customers */
    if (resource === 'customers') {
      if (method === 'GET' && !id) {
        const vendorId = req.query.get('vendor_id');
        return ok(
          visibleCustomers(me)
            .filter((c) => !vendorId || c.vendor_id === vendorId)
            .map(withDeviceCount),
        );
      }
      if (method === 'GET' && id) {
        const customer = visibleCustomers(me).find((c) => c.id === id);
        return customer ? ok(withDeviceCount(customer)) : fail(404, 'Customer not found');
      }
      if (method === 'POST' && !id) {
        if (me.role === 'customer') return fail(403, 'Customers cannot create customers.');
        const vendorId = me.role === 'vendor' ? me.vendor_id : str(req.body, 'vendor_id');
        const vendor = vendors.find((v) => v.id === vendorId);
        const name = str(req.body, 'name');
        const email = str(req.body, 'email').toLowerCase();
        if (!vendor) return fail(400, 'Choose a vendor.');
        if (!name || !email) return fail(400, 'Name and email are required.');
        if (profiles.some((p) => p.email === email) || customers.some((c) => c.contact_email === email)) {
          return fail(409, 'That email already has an account.');
        }
        const customer: Customer = {
          id: nextId('customer'),
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          vendor_code: vendor.code,
          name,
          code: `CUST-${String(customers.length + 1).padStart(2, '0')}`,
          status: 'active',
          contact_email: email,
          device_count: 0,
          created_at: new Date(clock()).toISOString(),
        };
        customers.unshift(customer);
        activity.push({ kind: 'customer', name, at: customer.created_at, actor: me.full_name, vendor_id: vendor.id, customer_id: customer.id });
        return ok({ customer, credentials: issue(email) }, 201);
      }
    }

    /* -------------------------------------------------------- Devices */
    if (resource === 'devices') {
      if (method === 'GET' && !id) {
        const customerId = req.query.get('customer_id');
        return ok(
          visibleDevices(me)
            .filter((d) => !customerId || d.customer_id === customerId)
            .map(publicDevice),
        );
      }

      if (method === 'POST' && !id) {
        if (me.role === 'vendor') return fail(403, 'Vendors cannot register devices.');
        const customerId = me.role === 'customer' ? me.customer_id : str(req.body, 'customer_id');
        const customer = customers.find((c) => c.id === customerId);
        const name = str(req.body, 'name');
        const imei = str(req.body, 'imei');
        if (!customer) return fail(400, 'Choose a customer.');
        if (!name) return fail(400, 'Device name is required.');
        if (!/^\d{15}$/.test(imei)) return fail(400, 'IMEI must be exactly 15 digits.');
        if (devices.some((d) => d.imei === imei)) return fail(409, 'That IMEI is already registered.');
        const device: DemoDevice = {
          id: nextId('device'),
          customer_id: customer.id,
          customer_name: customer.name,
          vendor_id: customer.vendor_id,
          device_identifier: imei,
          imei,
          name,
          device_type: str(req.body, 'device_type') || null,
          location: str(req.body, 'location') || null,
          status: 'active',
          last_seen_at: null,
          created_at: new Date(clock()).toISOString(),
          reporting: { kind: 'never' },
          signal: { phase: 0, socBase: 0, sohBase: 0, tempBase: 0 },
        };
        devices.unshift(device);
        activity.push({
          kind: 'device',
          name,
          at: device.created_at,
          actor: me.full_name,
          customer_name: customer.name,
          imei,
          vendor_id: customer.vendor_id,
          customer_id: customer.id,
        });
        return ok(publicDevice(device), 201);
      }

      const device = id ? visibleDevices(me).find((d) => d.id === id) : undefined;
      if (method === 'GET' && id && !device) return fail(404, 'Device not found');

      if (method === 'GET' && device && !sub) return ok(publicDevice(device));

      if (method === 'GET' && device && sub === 'telemetry' && leaf === 'latest') {
        const reading = latest(device);
        return reading ? ok(reading) : fail(404, 'No telemetry received yet');
      }

      if (method === 'GET' && device && sub === 'telemetry' && leaf === 'history') {
        const requested = Number(req.query.get('limit') ?? 120);
        const limit = Number.isFinite(requested) ? Math.min(MAX_HISTORY, Math.max(1, Math.floor(requested))) : 120;
        return ok(history(device, limit));
      }
    }

    // Unknown routes are 404, never 401, so the client never signs the user out over them.
    return fail(404, `Dev demo backend has no route for ${method} ${req.path}`);
  }

  return { handle };
}

export type DemoApi = ReturnType<typeof createDemoApi>;
