import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Overview } from '../types/database.types';
import { DEMO_ACCOUNTS, DEMO_PASSWORD_NOTICE, DEMO_TOKEN_PREFIX, createDemoApi } from './demoApi.ts';

const NOW = Date.parse('2026-11-02T12:00:00.000Z');

function client(clock = () => NOW) {
  const api = createDemoApi(clock);
  let token: string | null = null;
  const call = (method: string, url: string, body: unknown = null) => {
    const parsed = new URL(url, 'http://127.0.0.1:8000');
    return api.handle({
      method,
      path: parsed.pathname,
      query: parsed.searchParams,
      authorization: token ? `Bearer ${token}` : null,
      body,
    });
  };
  const login = (email: string) => {
    const res = call('POST', '/api/auth/login', { email, password: 'anything' });
    token = (res.body as { access_token: string }).access_token;
    return res;
  };
  return { call, login, setToken: (t: string | null) => (token = t) };
}

test('signs in the three demo accounts and rejects anything else', () => {
  const c = client();
  for (const email of DEMO_ACCOUNTS) {
    const res = c.login(email);
    assert.equal(res.status, 200);
    const body = res.body as { access_token: string; profile: { email: string; must_change_password: boolean } };
    assert.ok(body.access_token.startsWith(DEMO_TOKEN_PREFIX));
    assert.equal(body.profile.email, email);
    assert.equal(body.profile.must_change_password, false);
  }
  assert.equal(c.call('POST', '/api/auth/login', { email: 'admin@shade.local', password: 'x' }).status, 401);
  assert.equal(c.call('POST', '/api/auth/login', { email: DEMO_ACCOUNTS[0], password: '' }).status, 401);
});

test('requires a demo token and ignores real-looking ones', () => {
  const c = client();
  assert.equal(c.call('GET', '/api/auth/me').status, 401);
  c.setToken('eyJhbGciOiJIUzI1NiJ9.real.jwt');
  assert.equal(c.call('GET', '/api/auth/me').status, 401);
  c.login(DEMO_ACCOUNTS[0]);
  assert.equal((c.call('GET', '/api/auth/me').body as { role: string }).role, 'admin');
});

test('the demo uses the original sample names and clearly fictional IMEIs', () => {
  const c = client();
  c.login(DEMO_ACCOUNTS[0]);
  const vendors = (c.call('GET', '/api/vendors').body as { name: string }[]).map((v) => v.name);
  const customers = (c.call('GET', '/api/customers').body as { name: string }[]).map((x) => x.name);
  const devices = c.call('GET', '/api/devices').body as { name: string; imei: string; device_identifier: string }[];
  assert.deepEqual(vendors, ['Vendor A', 'Vendor B', 'Vendor C']);
  assert.ok(['Customer A1', 'Customer A2', 'Customer B1'].every((n) => customers.includes(n)));
  assert.ok(devices.some((d) => d.name === 'Main HQ Battery' && d.device_identifier === 'BMS-A001'));
  assert.ok(devices.some((d) => d.name === 'Branch 1 Backup' && d.device_identifier === 'BMS-A002'));
  assert.equal(devices.length, 8);
  assert.ok(devices.every((d) => /^DEMO-IMEI-\d{4}$/.test(d.imei)), 'never a valid 15-digit IMEI');
});

test('each role sees only its own records', () => {
  const c = client();
  const ids = (path: string) => (c.call('GET', path).body as { id: string }[]).map((r) => r.id).sort();

  c.login(DEMO_ACCOUNTS[0]);
  assert.equal(ids('/api/devices').length, 8);
  assert.equal(ids('/api/customers').length, 5);

  c.login(DEMO_ACCOUNTS[1]); // Vendor A
  assert.deepEqual(ids('/api/customers'), ['customer-a1', 'customer-a2']);
  assert.deepEqual(ids('/api/devices'), ['dev-a001', 'dev-a002', 'dev-a003']);
  assert.equal(c.call('GET', '/api/devices/dev-b001').status, 404, "another vendor's device is not visible");

  c.login(DEMO_ACCOUNTS[2]); // Customer A1
  assert.deepEqual(ids('/api/devices'), ['dev-a001', 'dev-a003']);
  assert.deepEqual(ids('/api/customers'), ['customer-a1']);
  assert.equal(c.call('GET', '/api/devices/dev-a002').status, 404);
});

test('list counts and statuses support the summary cards', () => {
  const c = client();
  c.login(DEMO_ACCOUNTS[0]);
  const vendors = c.call('GET', '/api/vendors').body as { status: string; customer_count: number; device_count: number }[];
  assert.equal(vendors.filter((v) => v.status === 'active').length, 2);
  assert.equal(vendors.filter((v) => v.status !== 'active').length, 1, 'one vendor pending activation');
  assert.deepEqual(vendors.map((v) => [v.customer_count, v.device_count]), [[2, 3], [2, 4], [1, 1]]);
  const vendor = c.call('GET', '/api/vendors/vendor-a').body as { code: string };
  assert.equal(vendor.code, 'VEN-A');
  const scoped = c.call('GET', '/api/customers?vendor_id=vendor-b').body as unknown[];
  assert.equal(scoped.length, 2);
  const forCustomer = c.call('GET', '/api/devices?customer_id=customer-b2').body as unknown[];
  assert.equal(forCustomer.length, 2);
});

test('streaming, offline and never-reported devices behave differently', () => {
  let now = NOW;
  const c = client(() => now);
  c.login(DEMO_ACCOUNTS[0]);

  const streaming = c.call('GET', '/api/devices/dev-a001/telemetry/latest');
  assert.equal(streaming.status, 200);
  const reading = streaming.body as Record<string, unknown> & { raw_data: { test_only: boolean }; received_at: string };
  assert.equal(reading.raw_data.test_only, true);
  for (const key of ['soc', 'soh', 'voltage', 'current', 'power', 'temperature']) {
    assert.equal(typeof reading[key], 'number', key);
  }
  assert.ok(NOW - Date.parse(reading.received_at) < 30_000, 'fresh enough to read as streaming');

  const offline = c.call('GET', '/api/devices/dev-a002/telemetry/latest').body as { received_at: string };
  const offlineAge = NOW - Date.parse(offline.received_at);
  assert.ok(offlineAge >= 60 * 60_000 && offlineAge < 62 * 60_000, 'Branch 1 Backup last reported an hour ago');

  assert.equal(c.call('GET', '/api/devices/dev-c001/telemetry/latest').status, 404);
  assert.deepEqual(c.call('GET', '/api/devices/dev-c001/telemetry/history?limit=120').body, []);
  assert.equal((c.call('GET', '/api/devices/dev-c001').body as { last_seen_at: null }).last_seen_at, null);

  now += 7 * 60_000;
  const later = c.call('GET', '/api/devices/dev-a001/telemetry/latest').body as { soc: number };
  assert.notEqual(later.soc, reading.soc, 'values move with time');
});

test('history honours limit, is oldest first, is capped, and ends at the last report', () => {
  const c = client();
  c.login(DEMO_ACCOUNTS[0]);
  const rows = c.call('GET', '/api/devices/dev-a001/telemetry/history?limit=120').body as { received_at: string }[];
  assert.equal(rows.length, 120);
  assert.ok(Date.parse(rows[0].received_at) < Date.parse(rows[119].received_at));
  assert.equal((c.call('GET', '/api/devices/dev-a001/telemetry/history?limit=99999').body as unknown[]).length, 500);
  const offline = c.call('GET', '/api/devices/dev-a002/telemetry/history?limit=5').body as { received_at: string }[];
  assert.ok(NOW - Date.parse(offline[4].received_at) >= 60 * 60_000);
});

test('the overview gives every dashboard section data, scoped by role', () => {
  const c = client();
  c.login(DEMO_ACCOUNTS[0]);
  const admin = c.call('GET', '/api/overview').body as Overview;
  assert.deepEqual(
    { ...admin.counts, last_ingest_at: typeof admin.counts.last_ingest_at },
    { vendors: 3, customers: 5, devices: 8, online: 5, never_reported: 1, attention: 2, last_ingest_at: 'string' },
  );
  assert.equal(admin.availability.length, 14);
  assert.ok(admin.availability.every((d) => d.reported <= d.registered));
  assert.ok(admin.activity.length > 0 && admin.activity.length <= 8);
  assert.deepEqual(
    admin.alerts.map((a) => a.type).sort(),
    ['fault', 'fault', 'info', 'warning', 'warning'],
  );
  assert.ok(admin.alerts.some((a) => a.message === 'Offline device detected: Branch 1 Backup'));
  assert.ok(admin.alerts.some((a) => a.message === 'High temperature on Cold Store Backup'));
  assert.equal(admin.fleet.warmest_device, 'Cold Store Backup');
  assert.ok(admin.fleet.avg_soc !== null && admin.fleet.avg_soh !== null);

  c.login(DEMO_ACCOUNTS[1]);
  const vendor = c.call('GET', '/api/overview').body as Overview;
  assert.ok(!('vendors' in vendor.counts));
  assert.deepEqual([vendor.counts.customers, vendor.counts.devices, vendor.counts.online], [2, 3, 2]);
  assert.ok(vendor.activity.every((a) => a.kind !== 'vendor'));

  c.login(DEMO_ACCOUNTS[2]);
  const customer = c.call('GET', '/api/overview').body as Overview;
  assert.deepEqual([customer.counts.devices, customer.counts.online], [2, 2]);
  assert.ok(customer.activity.every((a) => a.kind === 'device'));
});

test('roles are scoped like the real API', () => {
  const c = client();
  c.login(DEMO_ACCOUNTS[1]); // vendor
  assert.equal(c.call('GET', '/api/vendors').status, 403);
  assert.equal(c.call('POST', '/api/devices', { name: 'X', imei: '490154203237518' }).status, 403);
  c.login(DEMO_ACCOUNTS[2]); // customer
  assert.equal(c.call('POST', '/api/customers', { name: 'X', email: 'x@shade.test' }).status, 403);
});

test('onboarding forms work in memory, validate, and issue an obviously fake password', () => {
  const c = client();
  c.login(DEMO_ACCOUNTS[0]);
  const created = c.call('POST', '/api/vendors', { name: 'Acme Storage', email: 'acme@shade.test' });
  assert.equal(created.status, 201);
  const { vendor, credentials } = created.body as { vendor: { id: string; name: string }; credentials: { temporary_password: string } };
  assert.equal(vendor.name, 'Acme Storage');
  assert.equal(credentials.temporary_password, DEMO_PASSWORD_NOTICE);
  assert.equal(c.call('POST', '/api/vendors', { name: 'Again', email: 'acme@shade.test' }).status, 409);
  assert.equal((c.call('GET', '/api/vendors').body as unknown[]).length, 4);

  const customer = c.call('POST', '/api/customers', { name: 'Acme Site', email: 'site@acme.test', vendor_id: vendor.id });
  assert.equal(customer.status, 201);
  const customerId = (customer.body as { customer: { id: string } }).customer.id;

  assert.equal(c.call('POST', '/api/devices', { name: 'U', imei: '123', customer_id: customerId }).status, 400);
  const device = c.call('POST', '/api/devices', { name: 'Unit 1', imei: '490154203237518', customer_id: customerId });
  assert.equal(device.status, 201);
  assert.equal(c.call('POST', '/api/devices', { name: 'Unit 2', imei: '490154203237518', customer_id: customerId }).status, 409);
  const activity = (c.call('GET', '/api/overview').body as Overview).activity.map((a) => a.name);
  assert.ok(activity.includes('Unit 1') && activity.includes('Acme Site'), 'new records appear in recent activity');

  c.login(DEMO_ACCOUNTS[2]); // customer registers its own device
  const own = c.call('POST', '/api/devices', { name: 'Rooftop unit', imei: '356938035643809' });
  assert.equal(own.status, 201);
  assert.equal((own.body as { customer_id: string }).customer_id, 'customer-a1');

  assert.equal(createDemoApi(() => NOW).handle({ method: 'GET', path: '/api/health', query: new URLSearchParams(), authorization: null, body: null }).status, 200);
});

test('unknown routes are 404, never 401, so the client does not sign out', () => {
  const c = client();
  c.login(DEMO_ACCOUNTS[0]);
  assert.equal(c.call('GET', '/api/devices/dev-a001/racks').status, 404);
  assert.equal(c.call('GET', '/api/nope').status, 404);
});

/* ---------------------------------------------------------------- Gate */

const SRC = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const files = (function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') ? [path] : [];
  });
})(SRC).map((path) => ({ rel: relative(SRC, path), text: readFileSync(path, 'utf8') }));

test('src/dev is reachable only through the guarded dynamic import in main.tsx', () => {
  const importers = files
    .filter((f) => !f.rel.startsWith(`dev${sep}`))
    .filter((f) => /['"][^'"]*\/dev\/[^'"]*['"]/.test(f.text))
    .map((f) => f.rel);
  assert.deepEqual(importers, ['main.tsx']);

  const main = files.find((f) => f.rel === 'main.tsx')!.text;
  assert.doesNotMatch(main, /^\s*import\s[^\n]*['"]\.\/dev\//m, 'no static import of src/dev');
  assert.match(
    main,
    /import\.meta\.env\.DEV\s*&&\s*import\.meta\.env\.MODE === 'development'\s*&&\s*import\.meta\.env\.VITE_DEV_DEMO_BACKEND === 'true'\s*\)\s*\{\s*import\('\.\/dev\/demoBackend'\)/,
  );
});
