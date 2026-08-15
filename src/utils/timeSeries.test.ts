import test from 'node:test';
import assert from 'node:assert/strict';
import { compressTimeSeries } from './timeSeries.js';

test('compressTimeSeries groups repeated values into intervals', () => {
  const raw = [
    { timestamp: '2026-07-27T10:00:00Z', value: 80 },
    { timestamp: '2026-07-27T10:05:00Z', value: 80 },
    { timestamp: '2026-07-27T10:10:00Z', value: 81 },
    { timestamp: '2026-07-27T10:15:00Z', value: 81 },
    { timestamp: '2026-07-27T10:20:00Z', value: 79 }
  ];

  const compressed = compressTimeSeries(raw, { threshold: 0.5 });

  assert.deepEqual(compressed, [
    { startTime: '2026-07-27T10:00:00Z', endTime: '2026-07-27T10:10:00Z', value: 80 },
    { startTime: '2026-07-27T10:10:00Z', endTime: '2026-07-27T10:20:00Z', value: 81 },
    { startTime: '2026-07-27T10:20:00Z', endTime: null, value: 79 }
  ]);
});

test('compressTimeSeries can ignore small changes using threshold', () => {
  const raw = [
    { timestamp: '2026-07-27T10:00:00Z', value: 70 },
    { timestamp: '2026-07-27T10:05:00Z', value: 70.2 },
    { timestamp: '2026-07-27T10:10:00Z', value: 71 }
  ];

  const compressed = compressTimeSeries(raw, { threshold: 0.5 });

  assert.deepEqual(compressed, [
    { startTime: '2026-07-27T10:00:00Z', endTime: '2026-07-27T10:10:00Z', value: 70 },
    { startTime: '2026-07-27T10:10:00Z', endTime: null, value: 71 }
  ]);
});
