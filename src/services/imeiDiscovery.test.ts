import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoImeiDiscoveryService, ImeiDiscoveryError, isAbortError } from './imeiDiscovery.ts';
import { isValidImei } from '../utils/imei.ts';

test('demo discovery returns a clearly labelled simulated identifier', async () => {
  const service = new DemoImeiDiscoveryService({ delayMs: 5 });
  const result = await service.discover();

  assert.equal(result.identifier, 'DEMO-IMEI-0001');
  assert.equal(result.isDemo, true);
  assert.equal(result.source, 'demo-simulation');
  assert.equal(isValidImei(result.identifier), false);
});

test('each successful attempt yields the next demo identifier', async () => {
  const service = new DemoImeiDiscoveryService({ delayMs: 1 });
  assert.equal((await service.discover()).identifier, 'DEMO-IMEI-0001');
  assert.equal((await service.discover()).identifier, 'DEMO-IMEI-0002');
});

test('aborting cancels discovery with an AbortError', async () => {
  const service = new DemoImeiDiscoveryService({ delayMs: 50 });
  const controller = new AbortController();
  const pending = service.discover(controller.signal);
  controller.abort();

  await assert.rejects(pending, (err) => isAbortError(err));
});

test('an already-aborted signal rejects immediately', async () => {
  const service = new DemoImeiDiscoveryService({ delayMs: 50 });
  await assert.rejects(service.discover(AbortSignal.abort()), (err) => isAbortError(err));
});

test('retry after a cancelled attempt still succeeds', async () => {
  const service = new DemoImeiDiscoveryService({ delayMs: 5 });
  const controller = new AbortController();
  const cancelled = service.discover(controller.signal);
  controller.abort();
  await assert.rejects(cancelled);

  const result = await service.discover();
  assert.equal(result.identifier, 'DEMO-IMEI-0001');
});

test('retry after a failed attempt succeeds', async () => {
  const service = new DemoImeiDiscoveryService({ delayMs: 1, failAttempts: [1] });
  await assert.rejects(service.discover(), (err) => err instanceof ImeiDiscoveryError);

  const result = await service.discover();
  assert.equal(result.identifier, 'DEMO-IMEI-0001');
});
