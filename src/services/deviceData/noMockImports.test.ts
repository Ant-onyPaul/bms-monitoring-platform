import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Keeps simulated data out of the live device workspace. The demo source is the
   only module allowed to reach the simulation, and the page may only load it
   lazily, for an explicit preview. */

const SRC = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const DEMO_SOURCE = ['services', 'deviceData', 'demoSource.ts'].join(sep);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : [];
  });
}

const files = sourceFiles(SRC).map((path) => ({
  rel: relative(SRC, path),
  text: readFileSync(path, 'utf8'),
}));

// Runtime imports only: `import type` lines are erased at build time.
const runtimeImportsOf = (text: string, target: RegExp) =>
  text
    .split('\n')
    .filter((line) => /^\s*import\s/.test(line) || /from\s+['"]/.test(line))
    .join('\n')
    .replace(/import\s+type\s[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .match(new RegExp(`from\\s+['"][^'"]*${target.source}[^'"]*['"]`, 'g')) ?? [];

test('only the demo source imports the telemetry simulation', () => {
  const offenders = files
    .filter((f) => !f.rel.startsWith(`data${sep}`) && f.rel !== DEMO_SOURCE)
    .filter((f) => runtimeImportsOf(f.text, /data\/bmsTelemetry/).length > 0)
    .map((f) => f.rel);
  assert.deepEqual(offenders, []);
});

test('only the demo source resolves demonstration siting', () => {
  const offenders = files
    .filter((f) => !f.rel.startsWith(`data${sep}`) && f.rel !== DEMO_SOURCE)
    .filter((f) => /\bgetDeviceSiting\b/.test(f.text) || runtimeImportsOf(f.text, /data\/demoGeofence/).length > 0)
    .map((f) => f.rel);
  assert.deepEqual(offenders, []);
});

test('nothing imports the demo source statically', () => {
  const offenders = files
    .filter((f) => f.rel !== DEMO_SOURCE)
    .filter((f) => runtimeImportsOf(f.text, /deviceData\/demoSource/).length > 0)
    .map((f) => f.rel);
  assert.deepEqual(offenders, []);
});

test('the device page loads the demo source lazily', () => {
  const page = files.find((f) => f.rel === ['pages', 'shared', 'DeviceDetails.tsx'].join(sep));
  assert.ok(page, 'DeviceDetails.tsx exists');
  assert.match(page.text, /import\(\s*['"][^'"]*deviceData\/demoSource['"]\s*\)/);
});

test('the bms view components do not generate their own data', () => {
  const generators = /\b(getSystemTelemetry|getModuleCells|buildSeries|buildDailyEnergy|TELEMETRY_PROVENANCE|TOPOLOGY)\b/;
  const offenders = files
    .filter((f) => f.rel.startsWith(['components', 'bms'].join(sep) + sep))
    .filter((f) => generators.test(f.text))
    .map((f) => f.rel);
  assert.deepEqual(offenders, []);
});
