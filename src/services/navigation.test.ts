import test from 'node:test';
import assert from 'node:assert/strict';
import type { Device, Overview } from '../types/database.types';
import { alertIndicator, toDeviceShortcuts, toNavAlerts } from './navigation.ts';

const alert = (type: Overview['alerts'][number]['type'], at: string, message = `${type} at ${at}`) => ({
  type,
  message,
  at,
  source: 'Site · IMEI 490154203237518',
  code: `${type.toUpperCase()}-1`,
  detail: '',
});

test('alerts map to bell entries, most severe first and newest first within a severity', () => {
  const entries = toNavAlerts(
    [
      alert('info', '2026-11-02T10:00:00Z'),
      alert('warning', '2026-11-02T09:00:00Z', 'older warning'),
      alert('fault', '2026-11-02T08:00:00Z'),
      alert('warning', '2026-11-02T11:00:00Z', 'newer warning'),
    ],
    (iso) => `age(${iso})`,
  );
  assert.deepEqual(entries.map((e) => e.tone), ['crit', 'warn', 'warn', 'info']);
  assert.deepEqual(entries.slice(1, 3).map((e) => e.title), ['newer warning', 'older warning']);
  assert.equal(entries[0].context, 'Site · IMEI 490154203237518 · FAULT-1');
  assert.equal(entries[0].time, 'age(2026-11-02T08:00:00Z)');
  assert.equal(new Set(entries.map((e) => e.id)).size, entries.length, 'ids are unique');
});

test('no alerts means an empty bell, not invented ones', () => {
  assert.deepEqual(toNavAlerts([], () => ''), []);
  assert.equal(alertIndicator([]), null);
  assert.equal(alertIndicator(null), null);
});

test('the bell indicator follows the most severe alert present', () => {
  const entries = (types: Overview['alerts'][number]['type'][]) =>
    toNavAlerts(types.map((t) => alert(t, '2026-11-02T10:00:00Z')), () => '');
  assert.equal(alertIndicator(entries(['info', 'fault', 'warning'])), 'crit');
  assert.equal(alertIndicator(entries(['info', 'warning'])), 'warn');
  assert.equal(alertIndicator(entries(['info'])), 'info');
});

const device = (over: Partial<Device>): Device => ({
  id: 'uuid-1',
  customer_id: 'c1',
  device_identifier: '490154203237518',
  name: 'North yard BESS',
  device_type: null,
  location: 'Kochi',
  status: 'active',
  last_seen_at: null,
  created_at: '2026-11-01T00:00:00Z',
  ...over,
});

test('device shortcuts route under the signed-in role and use the real device id', () => {
  const [admin] = toDeviceShortcuts([device({})], 'admin');
  assert.deepEqual(admin, {
    id: 'device-uuid-1',
    label: 'North yard BESS',
    hint: '490154203237518 · Kochi',
    path: '/admin/devices/uuid-1',
  });
  assert.equal(toDeviceShortcuts([device({})], 'vendor')[0].path, '/vendor/devices/uuid-1');
  assert.equal(toDeviceShortcuts([device({})], 'customer')[0].path, '/customer/devices/uuid-1');
});

test('device shortcuts prefer the IMEI field, omit missing parts, and escape ids', () => {
  const [s] = toDeviceShortcuts([device({ id: 'a/b', imei: '356938035643809', location: null })], 'admin');
  assert.equal(s.hint, '356938035643809');
  assert.equal(s.path, '/admin/devices/a%2Fb');
  assert.deepEqual(toDeviceShortcuts([], 'admin'), []);
});
