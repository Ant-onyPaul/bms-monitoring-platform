import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  DeviceSiting,
  GeofenceEvaluation,
  evaluateGeofence,
  formatDistance,
  formatLatitude,
  formatLongitude,
  getDeviceSiting,
  metresPerDegreeLng,
  projectToLocalMetres,
} from '../../data/demoGeofence';
import { IconLocation, IconInfo, IconExternal } from '../icons';

/* =============================================================================
   DeviceLocation

   The review asked for the device location to be tappable, opening a map with
   IoT geofencing.

   The platform still has no position feed — `devices.location` is a free-text
   place name and there is no coordinate or geofence column anywhere. So the map
   renders DEMONSTRATION coordinates from `data/demoGeofence.ts`, which is kept
   deliberately outside the schema types. It is labelled as demo data on the
   face of the map, beside the title, and in the note underneath; the labelling
   is driven by `siting.source`, so it disappears by itself the day a real fix
   arrives rather than needing to be remembered.

   The map is hand-drawn SVG: no map library, no external tiles, no network. A
   real street map under a fabricated pin would be the most convincing thing on
   the page and the least true — a measured schematic shows position, boundary
   and clearance honestly, and swapping in a tile provider later touches only
   `GeofenceMap`.
   ========================================================================== */

interface DeviceLocationProps {
  location: string | null;
  /** Shown in the dialog so the user knows which unit they are locating. */
  deviceName: string;
  deviceIdentifier: string;
  /** `header` is the large device-header treatment; `inline` fits a data cell. */
  variant?: 'header' | 'inline';
  className?: string;
}

export default function DeviceLocation({
  location,
  deviceName,
  deviceIdentifier,
  variant = 'header',
  className = '',
}: DeviceLocationProps) {
  const [open, setOpen] = useState(false);
  const hasLocation = Boolean(location);
  const label = location ?? 'Location not set';

  const shared =
    'group inline-flex items-center gap-2 rounded-md cursor-pointer text-left ' +
    'transition-colors duration-150 [transition-timing-function:var(--ease-precise)] ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ' +
    'disabled:cursor-default disabled:opacity-100';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!hasLocation}
        aria-haspopup="dialog"
        title={hasLocation ? `View ${label} on map` : undefined}
        className={
          variant === 'header'
            ? `${shared} -ml-1 px-1 py-0.5 hover:bg-surface-3 ${className}`
            : `${shared} ${className}`
        }
      >
        <IconLocation
          size={variant === 'header' ? 15 : 12}
          className={`shrink-0 ${
            hasLocation ? 'text-ink-3 group-hover:text-brand-ink' : 'text-ink-4'
          } transition-colors duration-150`}
        />

        <span
          className={
            variant === 'header'
              ? `text-[15px] font-medium ${
                  hasLocation
                    ? 'text-ink-2 group-hover:text-ink underline decoration-line-2 decoration-1 underline-offset-4 group-hover:decoration-brand'
                    : 'text-ink-4 italic'
                }`
              : `text-[13.5px] font-medium truncate ${
                  hasLocation
                    ? 'text-ink underline decoration-line-2 decoration-1 underline-offset-[3px] group-hover:decoration-brand'
                    : 'text-ink-4 italic'
                }`
          }
        >
          {label}
        </span>

        {hasLocation && (
          <IconExternal
            size={variant === 'header' ? 12 : 11}
            className="shrink-0 text-ink-4 opacity-0 group-hover:opacity-100
              group-focus-visible:opacity-100 transition-opacity duration-150"
          />
        )}
      </button>

      <LocationDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        location={label}
        deviceName={deviceName}
        deviceIdentifier={deviceIdentifier}
      />
    </>
  );
}

/* -----------------------------------------------------------------------------
   LocationDialog

   Shows the geofence map when siting exists for the unit, and the original
   "pending" frame when it does not. A device with no record never borrows
   another device's coordinates.
   -------------------------------------------------------------------------- */

function LocationDialog({
  isOpen,
  onClose,
  location,
  deviceName,
  deviceIdentifier,
}: {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  deviceName: string;
  deviceIdentifier: string;
}) {
  const siting = getDeviceSiting(deviceIdentifier);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Device location"
      description={`${deviceName} · ${deviceIdentifier}`}
      widthClass="max-w-2xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {siting ? (
        <SitedLocation siting={siting} />
      ) : (
        <UnsitedLocation location={location} />
      )}
    </Modal>
  );
}

/* -----------------------------------------------------------------------------
   SitedLocation — the map view.
   -------------------------------------------------------------------------- */

function SitedLocation({ siting }: { siting: DeviceSiting }) {
  const evaluation = evaluateGeofence(siting.position, siting.geofence);
  const isDemo = siting.source === 'demo';

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------ Site identity */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <IconLocation size={16} className="text-ink-3 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="label-technical block mb-1">Registered site</span>
            <span className="text-[16px] font-semibold text-ink block truncate">
              {siting.siteName}
            </span>
            <span className="text-[12px] text-ink-3 block truncate mt-0.5">{siting.address}</span>
          </div>
        </div>

        {isDemo && (
          <Badge tone="warn" size="xs" className="shrink-0 mt-0.5">
            Demo data
          </Badge>
        )}
      </div>

      {/* ------------------------------------------------ Map */}
      <GeofenceMap siting={siting} evaluation={evaluation} isDemo={isDemo} />

      {/* ------------------------------------------------ Legend */}
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <LegendItem swatch={<span className="w-2.5 h-2.5 rounded-full bg-brand block" />}>
          Device position
        </LegendItem>
        <LegendItem
          swatch={
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-brand block" />
          }
        >
          Geofence · {siting.geofence.radiusMetres} m radius
        </LegendItem>
        <LegendItem
          swatch={
            <span className="relative w-2.5 h-2.5 block">
              <span className="absolute inset-x-0 top-1/2 h-px bg-ink-4" />
              <span className="absolute inset-y-0 left-1/2 w-px bg-ink-4" />
            </span>
          }
        >
          Registered centre
        </LegendItem>
      </ul>

      {/* ------------------------------------------------ Readings */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line rounded-md overflow-hidden border border-line">
        <ReadingCell label="Latitude" value={formatLatitude(siting.position.latitude)} />
        <ReadingCell label="Longitude" value={formatLongitude(siting.position.longitude)} />
        <ReadingCell
          label="Geofence radius"
          value={`${siting.geofence.radiusMetres} m`}
          hint={siting.geofence.label}
        />
        <ReadingCell
          label="From centre"
          value={formatDistance(evaluation.distanceFromCentreMetres)}
          hint={
            evaluation.insideFence
              ? `${formatDistance(evaluation.marginMetres)} inside boundary`
              : `${formatDistance(Math.abs(evaluation.marginMetres))} beyond boundary`
          }
          tone={evaluation.insideFence ? 'ok' : 'warn'}
        />
      </dl>

      {/* ------------------------------------------------ Provenance */}
      {isDemo && (
        <div
          role="note"
          className="flex items-start gap-2.5 px-3.5 py-3 rounded-md bg-warn-surface border border-warn-line"
        >
          <IconInfo size={14} className="text-warn-ink shrink-0 mt-0.5" />
          <div className="text-[12px] text-warn-ink leading-relaxed">
            <p className="font-semibold mb-1">
              Demonstration coordinates — not a live GPS fix.
            </p>
            <p>
              The position and geofence above are fixed sample values from{' '}
              <span className="data-technical">data/demoGeofence.ts</span>, shown so the map and
              boundary interaction can be reviewed. They are not device telemetry. Real siting
              needs <span className="data-technical">latitude</span> /{' '}
              <span className="data-technical">longitude</span> on the device record and a geofence
              boundary per device; once those exist, this view reads them with no change to the map
              itself.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ swatch, children }: { swatch: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="shrink-0 flex items-center justify-center">{swatch}</span>
      <span className="text-[11.5px] text-ink-3">{children}</span>
    </li>
  );
}

function ReadingCell({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'ok' | 'warn';
}) {
  const valueTone =
    tone === 'ok' ? 'text-ok-ink' : tone === 'warn' ? 'text-warn-ink' : 'text-ink';

  return (
    <div className="bg-surface px-3.5 py-3 min-w-0">
      <dt className="label-technical truncate mb-1.5">{label}</dt>
      <dd className={`data-technical text-[13px] font-medium truncate ${valueTone}`} title={value}>
        {value}
      </dd>
      {hint && <p className="text-[10.5px] text-ink-4 mt-1 truncate">{hint}</p>}
    </div>
  );
}

/* -----------------------------------------------------------------------------
   GeofenceMap

   A measured plan view, drawn to scale around the geofence centre. The fence
   always occupies the same pixel radius, so the map scales itself to whatever
   radius a device is configured with and the drawing never has to be retuned.

   No tiles, no library, no network — everything below is arithmetic and paths.
   Colours are theme tokens, so the map follows light/dark with the rest of the
   app.
   -------------------------------------------------------------------------- */

const VIEW_W = 480;
const VIEW_H = 300;
const CENTRE_X = VIEW_W / 2;
const CENTRE_Y = VIEW_H / 2;
/** Fence radius in user units. Everything else derives from this. */
const FENCE_RADIUS_PX = 118;

const NICE_STEPS = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];

/** Smallest "round" number at or above `target`, for grid and scale intervals. */
function niceStep(target: number): number {
  return NICE_STEPS.find((s) => s >= target) ?? NICE_STEPS[NICE_STEPS.length - 1];
}

function GeofenceMap({
  siting,
  evaluation,
  isDemo,
}: {
  siting: DeviceSiting;
  evaluation: GeofenceEvaluation;
  isDemo: boolean;
}) {
  const { geofence, position, accuracyMetres } = siting;

  /* Scale: metres per user unit, fixed by the fence radius. */
  const mPerUnit = geofence.radiusMetres / FENCE_RADIUS_PX;
  const spanMetres = VIEW_W * mPerUnit;

  /* Device offset from the fence centre, projected onto the local plane. */
  const local = projectToLocalMetres(position, geofence.centre);
  const deviceX = CENTRE_X + local.x / mPerUnit;
  const deviceY = CENTRE_Y - local.y / mPerUnit;
  const accuracyR = Math.max(5, accuracyMetres / mPerUnit);

  /* Graticule. Lines are placed on round metre intervals from the centre; the
     edge labels convert those offsets back into degrees so the grid reads as a
     coordinate reference rather than decoration. */
  const gridMetres = niceStep(spanMetres / 6);
  const gridUnits = gridMetres / mPerUnit;

  const mPerDegLng = metresPerDegreeLng(geofence.centre.latitude);
  const verticals: { x: number; lng: number }[] = [];
  for (let k = -Math.ceil(CENTRE_X / gridUnits); k <= Math.ceil(CENTRE_X / gridUnits); k++) {
    const x = CENTRE_X + k * gridUnits;
    if (x < 2 || x > VIEW_W - 2) continue;
    verticals.push({ x, lng: geofence.centre.longitude + (k * gridMetres) / mPerDegLng });
  }
  const horizontals: { y: number; lat: number }[] = [];
  for (let k = -Math.ceil(CENTRE_Y / gridUnits); k <= Math.ceil(CENTRE_Y / gridUnits); k++) {
    const y = CENTRE_Y - k * gridUnits;
    if (y < 2 || y > VIEW_H - 2) continue;
    horizontals.push({ y, lat: geofence.centre.latitude + (k * gridMetres) / 111_320 });
  }

  /* Scale bar. */
  const scaleMetres = niceStep(spanMetres / 5.5);
  const scaleUnits = scaleMetres / mPerUnit;

  /* Which graticule lines get an edge label.

     Grid spacing changes with the fence radius, so where the lines land moves
     from device to device — labels have to be chosen by position, not by index.
     Picking every other line looks tidy until a 180 m fence puts the two chosen
     lines directly under the demo chip and through the scale bar. These filters
     keep labels out of the three overlaid corners; whatever survives is legible
     at any radius. Decimation only kicks in once the edge would get crowded. */
  const latLabels = horizontals
    .filter((h) => h.y > 46 && h.y < VIEW_H - 40)
    .filter((_, i, arr) => arr.length <= 3 || i % 2 === 0);

  const lngLabels = verticals
    .filter((v) => v.x > 40 && v.x < VIEW_W - 120)
    .filter((_, i, arr) => arr.length <= 4 || i % 2 === 0);

  /* Radius spoke, drawn to the north-east so it clears the marker. */
  const spokeAngle = -Math.PI / 4;
  const spokeX = CENTRE_X + Math.cos(spokeAngle) * FENCE_RADIUS_PX;
  const spokeY = CENTRE_Y + Math.sin(spokeAngle) * FENCE_RADIUS_PX;

  const fenceTone = evaluation.insideFence ? 'var(--color-brand)' : 'var(--color-warn)';

  return (
    <div className="relative rounded-md border border-line overflow-hidden bg-surface-2">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-auto block"
        role="img"
        aria-label={
          `Plan view of ${siting.siteName}. Device at ${formatLatitude(position.latitude)}, ` +
          `${formatLongitude(position.longitude)}, ` +
          `${formatDistance(evaluation.distanceFromCentreMetres)} from the centre of a ` +
          `${geofence.radiusMetres} metre geofence, currently ` +
          `${evaluation.insideFence ? 'inside' : 'outside'} the boundary.` +
          (isDemo ? ' Demonstration coordinates, not live telemetry.' : '')
        }
      >
        <defs>
          <clipPath id="geofence-map-clip">
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} />
          </clipPath>
        </defs>

        <g clipPath="url(#geofence-map-clip)">
          <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="var(--color-surface-2)" />

          {/* ------------------------------------------ Graticule */}
          <g stroke="var(--color-line)" strokeWidth="1">
            {verticals.map((v) => (
              <line key={`v${v.x}`} x1={v.x} y1="0" x2={v.x} y2={VIEW_H} />
            ))}
            {horizontals.map((h) => (
              <line key={`h${h.y}`} x1="0" y1={h.y} x2={VIEW_W} y2={h.y} />
            ))}
          </g>

          {/* Centre axes sit a shade stronger than the rest of the grid */}
          <g stroke="var(--color-line-2)" strokeWidth="1">
            <line x1={CENTRE_X} y1="0" x2={CENTRE_X} y2={VIEW_H} />
            <line x1="0" y1={CENTRE_Y} x2={VIEW_W} y2={CENTRE_Y} />
          </g>

          {/* ------------------------------------------ Geofence */}
          <circle
            cx={CENTRE_X}
            cy={CENTRE_Y}
            r={FENCE_RADIUS_PX}
            fill={fenceTone}
            fillOpacity="0.10"
            stroke={fenceTone}
            strokeWidth="1.75"
            strokeDasharray="6 4"
            strokeOpacity="0.95"
          />

          {/* Radius spoke with its measurement */}
          <line
            x1={CENTRE_X}
            y1={CENTRE_Y}
            x2={spokeX}
            y2={spokeY}
            stroke={fenceTone}
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.7"
          />
          <text
            x={CENTRE_X + Math.cos(spokeAngle) * (FENCE_RADIUS_PX * 0.55)}
            y={CENTRE_Y + Math.sin(spokeAngle) * (FENCE_RADIUS_PX * 0.55) - 5}
            className="data-technical"
            fontSize="10"
            fill={fenceTone}
            textAnchor="middle"
          >
            {geofence.radiusMetres} m
          </text>

          {/* ------------------------------------------ Registered centre */}
          <g stroke="var(--color-ink-4)" strokeWidth="1.25">
            <line x1={CENTRE_X - 6} y1={CENTRE_Y} x2={CENTRE_X + 6} y2={CENTRE_Y} />
            <line x1={CENTRE_X} y1={CENTRE_Y - 6} x2={CENTRE_X} y2={CENTRE_Y + 6} />
          </g>

          {/* Offset from centre to the unit */}
          <line
            x1={CENTRE_X}
            y1={CENTRE_Y}
            x2={deviceX}
            y2={deviceY}
            stroke="var(--color-ink-4)"
            strokeWidth="1"
            strokeDasharray="2 3"
            strokeOpacity="0.8"
          />

          {/* ------------------------------------------ Device */}
          {/* Reported accuracy of the fix */}
          <circle
            cx={deviceX}
            cy={deviceY}
            r={accuracyR}
            fill="var(--color-brand)"
            fillOpacity="0.14"
            stroke="var(--color-brand)"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.55"
          />
          {/* Halo in the panel colour keeps the marker legible over the fence fill */}
          <circle
            cx={deviceX}
            cy={deviceY}
            r="6.5"
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth="3"
          />
          <circle cx={deviceX} cy={deviceY} r="5" fill="var(--color-brand)" />
          <circle cx={deviceX} cy={deviceY} r="1.75" fill="var(--color-surface-2)" />

          {/* Crosshair ticks — reads as a survey mark rather than a pin */}
          <g stroke="var(--color-brand)" strokeWidth="1.25">
            <line x1={deviceX} y1={deviceY - 11} x2={deviceX} y2={deviceY - 8} />
            <line x1={deviceX} y1={deviceY + 8} x2={deviceX} y2={deviceY + 11} />
            <line x1={deviceX - 11} y1={deviceY} x2={deviceX - 8} y2={deviceY} />
            <line x1={deviceX + 8} y1={deviceY} x2={deviceX + 11} y2={deviceY} />
          </g>

          {/* ------------------------------------------ Edge coordinates */}
          <g className="data-technical" fontSize="8.5" fill="var(--color-ink-4)">
            {lngLabels.map((v) => (
              <text key={`vl${v.x}`} x={v.x} y={VIEW_H - 6} textAnchor="middle">
                {v.lng.toFixed(4)}
              </text>
            ))}
            {latLabels.map((h) => (
              <text key={`hl${h.y}`} x="6" y={h.y - 4}>
                {h.lat.toFixed(4)}
              </text>
            ))}
          </g>

          {/* ------------------------------------------ North arrow */}
          <g transform={`translate(${VIEW_W - 26}, 20)`}>
            <path d="M 0 -9 L 4.5 5 L 0 2 L -4.5 5 Z" fill="var(--color-ink-3)" />
            <text
              x="0"
              y="17"
              className="data-technical"
              fontSize="9"
              fill="var(--color-ink-4)"
              textAnchor="middle"
            >
              N
            </text>
          </g>

          {/* ------------------------------------------ Scale bar */}
          <g transform={`translate(16, ${VIEW_H - 26})`}>
            <line x1="0" y1="0" x2={scaleUnits} y2="0" stroke="var(--color-ink-3)" strokeWidth="1.5" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--color-ink-3)" strokeWidth="1.5" />
            <line
              x1={scaleUnits}
              y1="-4"
              x2={scaleUnits}
              y2="4"
              stroke="var(--color-ink-3)"
              strokeWidth="1.5"
            />
            <text
              x={scaleUnits / 2}
              y="-7"
              className="data-technical"
              fontSize="9"
              fill="var(--color-ink-3)"
              textAnchor="middle"
            >
              {scaleMetres} m
            </text>
          </g>
        </g>
      </svg>

      {/* ------------------------------------------------ Overlay chips */}
      {isDemo && (
        <span
          className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2 py-1
            rounded bg-warn-surface border border-warn-line text-warn-ink
            text-[9.5px] font-semibold uppercase tracking-[0.1em]"
        >
          Demo coordinates
        </span>
      )}

      <span
        className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-2 py-1
          rounded bg-surface border border-line data-technical text-[10px] text-ink-3"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            evaluation.insideFence ? 'bg-ok' : 'bg-warn'
          }`}
        />
        {evaluation.insideFence ? 'Inside geofence' : 'Outside geofence'}
      </span>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   UnsitedLocation

   The original pending state, kept for any device with no siting record. An
   empty frame is the honest answer — better than borrowing another unit's
   position to fill the space.
   -------------------------------------------------------------------------- */

function UnsitedLocation({ location }: { location: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5">
        <IconLocation size={16} className="text-ink-3 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <span className="label-technical block mb-1">Registered site</span>
          <span className="text-[16px] font-semibold text-ink">{location}</span>
        </div>
      </div>

      <div
        role="img"
        aria-label="Map view placeholder — no position on record for this device"
        className="relative h-48 rounded-md border border-dashed border-line-2 bg-surface-2
          blueprint-grid flex flex-col items-center justify-center gap-2 text-center px-6"
      >
        <IconLocation size={20} className="text-ink-4" />
        <p className="text-[13px] font-medium text-ink-2">No position on record</p>
        <p className="text-[11.5px] text-ink-4 max-w-xs leading-relaxed">
          This unit has no coordinates or geofence, so the map stays empty rather than showing
          another device's position.
        </p>
      </div>

      <div
        role="note"
        className="flex items-start gap-2.5 px-3.5 py-3 rounded-md bg-info-surface border border-info-line"
      >
        <IconInfo size={14} className="text-info-ink shrink-0 mt-0.5" />
        <div className="text-[12px] text-info-ink leading-relaxed">
          <p className="font-semibold mb-1">Backend dependency — geofencing not connected.</p>
          <p>
            <span className="data-technical">devices.location</span> holds a free-text place name
            only. Rendering a map needs coordinates (
            <span className="data-technical">devices.latitude</span> /{' '}
            <span className="data-technical">devices.longitude</span>), a geofence boundary per
            device, and a position feed from the unit.
          </p>
        </div>
      </div>
    </div>
  );
}
