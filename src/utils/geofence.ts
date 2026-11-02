/* =============================================================================
   geofence — siting types, geometry and formatting.

   Pure helpers with no data of their own, so the location view can use them
   without pulling the demonstration records in data/demoGeofence.ts into the
   live bundle.
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
