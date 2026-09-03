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
   id, so no call site had to change to adopt this.

   Replacing this with real IoT data
   ---------------------------------
   1. Add `latitude`, `longitude`, `position_accuracy_m` and `position_fixed_at`
      to the `devices` row (or to a `device_positions` time-series table if the
      unit is mobile and history matters).
   2. Add a geofence record per device: centre point + `radius_m`, or a polygon
      boundary if a circle is too coarse for the site.
   3. Rewrite `getDeviceSiting()` below to read those fields and return
      `source: 'device-gps'`. Nothing else in the UI needs to change — the map
      already renders whatever this function returns, and the DEMO badge is
      driven by `source`, so it disappears on its own once the data is real.

   Until step 3 happens, every consumer must keep surfacing `source: 'demo'`
   to the user. Do not quietly drop that label.
   ========================================================================== */

/** A WGS-84 point. */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** A circular allowed area centred on the registered site. */
export interface Geofence {
  centre: GeoPoint;
  radiusMetres: number;
  /** Human name for the boundary, e.g. "HQ service yard". */
  label: string;
}

/**
 * Where a coordinate came from. The UI keys its honesty labelling off this —
 * `demo` must always be surfaced as demonstration data.
 */
export type SitingSource = 'demo' | 'device-gps' | 'registered';

export interface DeviceSiting {
  siteName: string;
  address: string;
  /** Where the unit reports itself to be. */
  position: GeoPoint;
  /** Horizontal accuracy of the fix, in metres. */
  accuracyMetres: number;
  geofence: Geofence;
  /** ISO-8601 timestamp of the fix. Fixed, not `new Date()` — a demo value
      that ticks like a live feed would be misleading. */
  fixedAt: string;
  source: SitingSource;
}

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

/* -----------------------------------------------------------------------------
   Geometry

   Small-area helpers. At geofence scale (hundreds of metres) an equirectangular
   projection is accurate to well under a metre, which is far inside the
   accuracy of any GPS fix these would ever be compared against.
   -------------------------------------------------------------------------- */

const METRES_PER_DEGREE_LAT = 111_320;

/** Metres per degree of longitude shrinks with latitude. */
export function metresPerDegreeLng(latitude: number): number {
  return METRES_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);
}

/**
 * Projects `point` onto a local plane centred on `origin`.
 * +x is east, +y is north, both in metres.
 */
export function projectToLocalMetres(point: GeoPoint, origin: GeoPoint) {
  return {
    x: (point.longitude - origin.longitude) * metresPerDegreeLng(origin.latitude),
    y: (point.latitude - origin.latitude) * METRES_PER_DEGREE_LAT,
  };
}

/** Great-circle distance in metres. */
export function metresBetween(a: GeoPoint, b: GeoPoint): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface GeofenceEvaluation {
  insideFence: boolean;
  /** Distance from the device to the geofence centre, metres. */
  distanceFromCentreMetres: number;
  /** Clearance to the boundary. Positive inside, negative outside. */
  marginMetres: number;
}

export function evaluateGeofence(position: GeoPoint, geofence: Geofence): GeofenceEvaluation {
  const distance = metresBetween(position, geofence.centre);
  return {
    insideFence: distance <= geofence.radiusMetres,
    distanceFromCentreMetres: distance,
    marginMetres: geofence.radiusMetres - distance,
  };
}

/* -----------------------------------------------------------------------------
   Formatting
   -------------------------------------------------------------------------- */

export function formatLatitude(latitude: number): string {
  return `${Math.abs(latitude).toFixed(5)}° ${latitude >= 0 ? 'N' : 'S'}`;
}

export function formatLongitude(longitude: number): string {
  return `${Math.abs(longitude).toFixed(5)}° ${longitude >= 0 ? 'E' : 'W'}`;
}

/** Metres below 1 km, kilometres above, always with a sensible precision. */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(2)} km`;
}
