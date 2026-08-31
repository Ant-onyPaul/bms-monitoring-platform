import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { IconLocation, IconInfo, IconExternal } from '../icons';

/* =============================================================================
   DeviceLocation

   The review asked for the device location to be tappable, opening a map with
   IoT geofencing.

   The map itself is NOT implemented here, and deliberately so: the schema has
   no coordinates (`devices.location` is a free-text place name), there is no
   geofence record, and no map provider is configured. Drawing a plausible-
   looking map would be inventing data.

   What this does provide is the finished interaction — an obvious, keyboard-
   reachable control, and a dialog with the map's frame already laid out — so
   that wiring a real provider later is a drop-in. The pending state is stated
   plainly rather than mocked.
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

   The map's frame, held open. The panel is explicitly an empty placeholder —
   not a stylised map — so nobody mistakes it for a rendered position.
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Device location"
      description={`${deviceName} · ${deviceIdentifier}`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2.5">
          <IconLocation size={16} className="text-ink-3 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="label-technical block mb-1">Registered site</span>
            <span className="text-[16px] font-semibold text-ink">{location}</span>
          </div>
        </div>

        {/* Reserved map frame. Intentionally blank — a decorative map would
            imply a position the system does not actually know. */}
        <div
          role="img"
          aria-label="Map view placeholder — geofencing integration pending"
          className="relative h-48 rounded-md border border-dashed border-line-2 bg-surface-2
            blueprint-grid flex flex-col items-center justify-center gap-2 text-center px-6"
        >
          <IconLocation size={20} className="text-ink-4" />
          <p className="text-[13px] font-medium text-ink-2">Map view not yet available</p>
          <p className="text-[11.5px] text-ink-4 max-w-xs leading-relaxed">
            This panel is reserved for the IoT geofencing map. It stays empty until the platform
            can supply a real position.
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
              <span className="data-technical">devices.location</span> holds a free-text place
              name only. Rendering a map needs coordinates (
              <span className="data-technical">devices.latitude</span> /{' '}
              <span className="data-technical">devices.longitude</span>), a geofence boundary per
              device, and a configured map provider. No position is fabricated here.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
