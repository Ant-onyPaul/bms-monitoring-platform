import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findDeviceWithImei,
  formatDemoIdentifier,
  isDemoIdentifier,
  isValidImei,
  normaliseImeiInput,
  validateImei,
} from './imei.ts';
import { canRegisterDevices } from './devicePermissions.ts';

// 490154203237518 is the standard Luhn-valid IMEI example (TAC 49015420).
const REAL_IMEI = '490154203237518';

test('isValidImei accepts a 15-digit IMEI with a valid check digit', () => {
  assert.equal(isValidImei(REAL_IMEI), true);
});

test('isValidImei rejects wrong check digit, wrong length and non-digits', () => {
  assert.equal(isValidImei('490154203237519'), false);
  assert.equal(isValidImei('49015420323751'), false);
  assert.equal(isValidImei('4901542032375180'), false);
  assert.equal(isValidImei('49015420323751A'), false);
  assert.equal(isValidImei(''), false);
});

test('demo identifiers are recognised but are never valid real IMEIs', () => {
  const demo = formatDemoIdentifier(1);
  assert.equal(demo, 'DEMO-IMEI-0001');
  assert.equal(isDemoIdentifier(demo), true);
  assert.equal(isValidImei(demo), false);
  assert.equal(isDemoIdentifier(REAL_IMEI), false);
});

test('validateImei applies rules by source', () => {
  assert.equal(validateImei('', 'manual'), null);
  assert.equal(validateImei(REAL_IMEI, 'manual'), null);
  assert.match(validateImei('DEMO-IMEI-0001', 'manual') ?? '', /Detect IMEI/);
  assert.match(validateImei('12345', 'manual') ?? '', /15 digits \(5 entered\)/);
  assert.match(validateImei('490154203237519', 'manual') ?? '', /check digit/);
  assert.match(validateImei('49015abc', 'manual') ?? '', /digits only/);

  assert.equal(validateImei('DEMO-IMEI-0001', 'demo-simulation'), null);
  assert.notEqual(validateImei(REAL_IMEI, 'demo-simulation'), null);
});

test('normaliseImeiInput strips spaces and dashes from pasted labels', () => {
  assert.equal(normaliseImeiInput('49-015420-323751-8'), REAL_IMEI);
  assert.equal(normaliseImeiInput(' 4901 5420 3237 518 '), REAL_IMEI);
});

test('findDeviceWithImei finds duplicates and ignores empty values', () => {
  const devices = [
    { name: 'A', imei: REAL_IMEI },
    { name: 'B', imei: 'DEMO-IMEI-0001' },
    { name: 'C', imei: null },
  ];
  assert.equal(findDeviceWithImei(REAL_IMEI, devices)?.name, 'A');
  assert.equal(findDeviceWithImei('DEMO-IMEI-0001', devices)?.name, 'B');
  assert.equal(findDeviceWithImei('DEMO-IMEI-0002', devices), undefined);
  assert.equal(findDeviceWithImei('', devices), undefined);
});

test('only admin and vendor roles may register devices', () => {
  assert.equal(canRegisterDevices('admin'), true);
  assert.equal(canRegisterDevices('vendor'), true);
  assert.equal(canRegisterDevices('customer'), false);
  assert.equal(canRegisterDevices(null), false);
  assert.equal(canRegisterDevices(undefined), false);
});
