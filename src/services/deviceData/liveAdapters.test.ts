import test from 'node:test';
import assert from 'node:assert/strict';
import type { DeviceCurrentData, TelemetryPoint } from '../../types/database.types';
import {
  BACKEND_REQUIREMENTS,
  LIVE_SECTIONS,
  STALE_MS,
  buildLiveHistory,
  buildLiveOverview,
  isStreaming,
  seriesFrom,
  sortHistory,
  toKw,
} from './liveAdapters.ts';

const NOW = Date.parse('2026-11-02T12:00:00.000Z');
const iso = (msAgo: number) => new Date(NOW - msAgo).toISOString();
const formatTime = (s: string) => s.slice(11, 19);
const formatAge = (s: string | null) => (s ? `age:${s}` : 'Never');

const latest = (over: Partial<DeviceCurrentData> = {}): DeviceCurrentData => ({
  id: 'row-1',
  device_id: 'dev-1',
  received_at: iso(5_000),
  temperature: 27.4,
  humidity: null,
  voltage: 51.2,
  current: -12.5,
  power: 966,
  soc: 81.3,
  soh: 97.1,
  status: null,
  raw_data: null,
  updated_at: iso(5_000),
  ...over,
});

const point = (msAgo: number, over: Partial<TelemetryPoint> = {}): TelemetryPoint => ({
  received_at: iso(msAgo),
  voltage: 51,
  current: 10,
  power: 500,
  soc: 80,
  soh: 97,
  temperature: 26,
  ...over,
});

test('toKw converts watts and keeps missing values missing', () => {
  assert.equal(toKw(966), 0.966);
  assert.equal(toKw(0), 0);
  assert.equal(toKw(null), null);
  assert.equal(toKw(undefined), null);
  assert.equal(toKw(Number.NaN), null);
});

test('isStreaming is true only for a recent message', () => {
  assert.equal(isStreaming(latest({ received_at: iso(1_000) }), NOW), true);
  assert.equal(isStreaming(latest({ received_at: iso(STALE_MS + 1) }), NOW), false);
  assert.equal(isStreaming(latest({ received_at: 'not-a-date' }), NOW), false);
  assert.equal(isStreaming(null, NOW), false);
});

test('sortHistory orders oldest first and drops unparseable rows', () => {
  const rows = [point(1_000), point(3_000), { ...point(2_000), received_at: 'bad' }, point(2_000)];
  assert.deepEqual(
    sortHistory(rows).map((r) => r.received_at),
    [iso(3_000), iso(2_000), iso(1_000)],
  );
});

test('seriesFrom skips readings the device did not send instead of zeroing them', () => {
  const rows = [point(3_000, { soc: 70 }), point(2_000, { soc: null }), point(1_000, { soc: 72 })];
  const series = seriesFrom(rows, 'soc', formatTime);
  assert.deepEqual(series.map((p) => p.value), [70, 72]);
  assert.deepEqual(series.map((p) => p.label), [formatTime(iso(3_000)), formatTime(iso(1_000))]);
});

test('live overview carries the API readings, converting power to kW', () => {
  const data = buildLiveOverview({ live: latest(), history: [], now: NOW, formatAge, formatTime });
  assert.equal(data.provenance, 'live');
  assert.deepEqual(data.readings, {
    voltage: 51.2,
    current: -12.5,
    powerKw: 0.966,
    soc: 81.3,
    soh: 97.1,
    energyKwh: null,
    ratedKwh: null,
    cycleCount: null,
    packTemperature: 27.4,
  });
  assert.equal(data.streaming, true);
  assert.equal(data.system.systemVoltage, 51.2);
});

test('live overview never fills sections the API does not report', () => {
  const data = buildLiveOverview({ live: latest(), history: [point(1_000)], now: NOW, formatAge, formatTime });
  assert.equal(data.fault, undefined, 'health is unknown, not "clear"');
  assert.equal(data.state, null);
  assert.equal(data.cellTemperatures, null);
  assert.equal(data.energyToday, null);
  assert.equal(data.protection, null);
  assert.equal(data.dailyEnergy, null);
  assert.equal(data.events, null);
  assert.equal(data.system.configuration, null);
  assert.equal(data.system.ratedKwh, null);
  assert.equal(data.system.siting, null);
  assert.equal(data.trends.temperatureKind, 'pack');
  assert.ok(data.system.dataSources.every((row) => row.status !== 'demo'));
});

test('live overview with no telemetry yet shows nothing but the gap', () => {
  const data = buildLiveOverview({ live: null, history: [], now: NOW, formatAge, formatTime });
  assert.ok(Object.values(data.readings).every((v) => v === null));
  assert.equal(data.streaming, false);
  assert.deepEqual(data.facts[0], { label: 'Last message', value: 'Never' });
  assert.deepEqual(data.trends.soc, []);
  assert.deepEqual(data.trends.voltage, []);
});

test('live overview omits missing readings rather than defaulting them', () => {
  const data = buildLiveOverview({
    live: latest({ soc: undefined, soh: null, power: null }),
    history: [],
    now: NOW,
    formatAge,
    formatTime,
  });
  assert.equal(data.readings.soc, null);
  assert.equal(data.readings.soh, null);
  assert.equal(data.readings.powerKw, null);
});

test('live overview trends come from history, oldest first, trailing window of 8', () => {
  const rows = Array.from({ length: 12 }, (_, i) => point((12 - i) * 1_000, { voltage: 50 + i, power: 1000 * i }));
  const data = buildLiveOverview({ live: latest(), history: [...rows].reverse(), now: NOW, formatAge, formatTime });
  assert.equal(data.trends.soc.length, 12);
  assert.deepEqual(data.trends.voltage, [54, 55, 56, 57, 58, 59, 60, 61]);
  assert.deepEqual(data.trends.powerKw, [4, 5, 6, 7, 8, 9, 10, 11]);
});

test('live history maps stored messages and has no rack series', () => {
  const rows = [point(3_000, { soc: 70, power: 2000 }), point(2_000, { soc: null }), point(1_000, { soc: 71 })];
  const data = buildLiveHistory(rows, formatTime);
  assert.equal(data.provenance, 'live');
  assert.deepEqual(data.socSamples, [
    { timestamp: iso(3_000), value: 70 },
    { timestamp: iso(1_000), value: 71 },
  ]);
  assert.deepEqual(data.system.powerKw?.map((p) => p.value), [2, 0.5, 0.5]);
  assert.equal(data.system.current.length, 3);
  assert.equal(data.racks, null);
  assert.doesNotMatch(data.currentCaption, /Positive values are discharge/);
});

test('only overview and history have live data; the rest name a backend requirement', () => {
  assert.deepEqual(LIVE_SECTIONS, {
    overview: true,
    history: true,
    racks: false,
    modules: false,
    cells: false,
    alerts: false,
  });
  for (const key of ['racks', 'modules', 'cells', 'alerts'] as const) {
    assert.match(BACKEND_REQUIREMENTS[key].endpoint, /^GET \/api\//);
  }
});
