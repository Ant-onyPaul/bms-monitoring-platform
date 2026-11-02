/* =============================================================================
   demoGeofence — DEMONSTRATION SITING DATA

   ⚠️  EVERYTHING IN THIS FILE IS FABRICATED FOR UI DEMONSTRATION ONLY.
       These coordinates are NOT a GPS fix, NOT device telemetry, and NOT read
       from the database. They exist so the location → map → geofence
       interaction can be reviewed before the IoT position feed is available.

   Why this lives in its own module
   --------------------------------
   The demo position is deliberately NOT added to the `Device` interface in
   `types/database.types.ts`. `Device` mirrors the real `devices` table, which
   has no latitude, longitude or geofence columns — putting fake coordinates on
   that type would make fabricated data indistinguishable from schema-backed
   data at every call site. Keeping a separate type here means the compiler
   itself enforces the boundary: nothing can read a demo coordinate while
   believing it came from the backend.

   Records are keyed by `device_identifier` (BMS-A001, …) rather than the row
   id. Only the demo source (services/deviceData/demoSource.ts) reads them, for
   the explicit layout preview; types, geometry and formatting live in
   utils/geofence.ts so the live location view never loads these records.

   Replacing this with real IoT data
   ---------------------------------
   1. Add `latitude`, `longitude`, `position_accuracy_m` and `position_fixed_at`
      to the `devices` row (or to a `device_positions` time-series table if the
      unit is mobile and history matters).
   2. Add a geofence record per device: centre point + `radius_m`, or a polygon
      boundary if a circle is too coarse for the site.
   3. Map those fields to a `DeviceSiting` with `source: 'device-gps'` in
      services/deviceData/liveAdapters.ts (`system.siting`). Nothing else in
      the UI needs to change — the map renders whatever siting it is given, and
      the DEMO badge is driven by `source`, so it disappears on its own once the
      data is real.

   Until step 3 happens, every consumer must keep surfacing `source: 'demo'`
   to the user. Do not quietly drop that label.
   ========================================================================== */

export * from '../utils/geofence';
import type { DeviceSiting } from '../utils/geofence';

/* -----------------------------------------------------------------------------
   The demo records.

   The site names match the free-text `devices.location` already held in the
   mock device rows, so nothing on screen contradicts anything else. Each unit
   sits a short distance off its geofence centre rather than dead in the middle,
   because a marker pinned exactly at the centre demonstrates nothing about how
   the boundary actually behaves.
   -------------------------------------------------------------------------- */

const DEMO_SITING: Record<string, DeviceSiting> = {
  'BMS-A001': {
    siteName: 'New York',
    address: 'Battery Park Substation · Manhattan, NY',
    position: { latitude: 40.7131, longitude: -74.00655 },
    accuracyMetres: 18,
    geofence: {
      centre: { latitude: 40.7128, longitude: -74.006 },
      radiusMetres: 250,
      label: 'HQ service yard',
    },
    fixedAt: '2026-08-31T09:42:00.000Z',
    source: 'demo',
  },
  'BMS-A002': {
    siteName: 'Boston',
    address: 'Seaport Distribution Yard · Boston, MA',
    position: { latitude: 42.35975, longitude: -71.0584 },
    accuracyMetres: 22,
    geofence: {
      centre: { latitude: 42.3601, longitude: -71.0589 },
      radiusMetres: 180,
      label: 'Branch compound',
    },
    fixedAt: '2026-08-31T08:15:00.000Z',
    source: 'demo',
  },
};

/**
 * Resolves siting for a device.
 *
 * Returns `null` for anything without a record — the caller then shows the
 * "position not available" state. It deliberately does NOT fall back to another
 * device's coordinates: showing unit B's position under unit A's name would be
 * worse than showing nothing.
 */
export function getDeviceSiting(deviceIdentifier: string | null | undefined): DeviceSiting | null {
  if (!deviceIdentifier) return null;
  return DEMO_SITING[deviceIdentifier] ?? null;
}
