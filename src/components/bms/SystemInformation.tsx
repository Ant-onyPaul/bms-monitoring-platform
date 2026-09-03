import { useState } from 'react';
import { Device } from '../../types/database.types';
import { SystemTelemetry } from '../../types/bms.types';
import { TELEMETRY_PROVENANCE, TOPOLOGY } from '../../data/bmsTelemetry';
import { useAuth } from '../../hooks/useAuth';
import { Panel, PanelHeader } from '../ui/Panel';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import DeviceLocation from './DeviceLocation';
import InputField from '../InputField';
import {
  IconDevice,
  IconLocation,
  IconVoltage,
  IconSliders,
  IconInfo,
  IconChevronDown,
  IconRack,
  IconPack,
  IconEnergy,
} from '../icons';

/* =============================================================================
   SystemInformation

   Identity and configuration for the installed system: what it is, where it is,
   and how it is wired.

   On configurability — the company asked for system information to be editable
   by Vendor/Admin. The current schema does expose the right columns
   (devices.name, devices.location, devices.device_type), but this application
   has no write path: it runs against local mock arrays with VITE_MOCK_AUTH, and
   no update mutation exists anywhere in the codebase.

   Rather than showing a Save button that silently does nothing, the dialog is
   built to its final shape with the write disabled and the exact missing
   dependency stated. Wiring it later is a one-function change.
   ========================================================================== */

interface SystemInformationProps {
  device: Device;
  telemetry: SystemTelemetry;
  className?: string;
}

export default function SystemInformation({
  device,
  telemetry,
  className = '',
}: SystemInformationProps) {
  const { profile } = useAuth();
  const [configOpen, setConfigOpen] = useState(false);

  // Configuration is a Vendor/Admin capability; customers get a read-only view.
  const canConfigure = profile?.role === 'admin' || profile?.role === 'vendor';

  return (
    <>
      <Panel flush className={`overflow-hidden ${className}`}>
        <div className="px-5 pt-4">
          <PanelHeader
            title="System information"
            icon={IconDevice}
            actions={
              canConfigure ? (
                <Button size="sm" variant="secondary" icon={IconSliders} onClick={() => setConfigOpen(true)}>
                  Configure
                </Button>
              ) : undefined
            }
            divided
          />
        </div>

        {/* Identity — location is given its own emphasised row, as requested */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line">
          <InfoCell icon={IconDevice} label="Device name" value={device.name} emphasis />
          {/* Location is interactive here too — same control as the device
              header, so the map entry point is wherever the location appears. */}
          <div className="bg-surface px-5 py-4 min-w-0">
            <span className="flex items-center gap-1.5 mb-1.5">
              <IconLocation size={12} className="text-ink-4 shrink-0" />
              <span className="label-technical truncate">Location</span>
            </span>
            <DeviceLocation
              location={device.location}
              deviceName={device.name}
              deviceIdentifier={device.device_identifier}
              variant="inline"
            />
          </div>
          <InfoCell
            icon={IconVoltage}
            label="System voltage"
            value={`${telemetry.batteryVoltage.toFixed(1)} V`}
            emphasis
            mono
          />
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border-t border-line">
          <InfoCell icon={IconDevice} label="Identifier" value={device.device_identifier} mono />
          <InfoCell icon={IconPack} label="Device type" value={device.device_type ?? '—'} mono />
          <InfoCell
            icon={IconRack}
            label="Configuration"
            value={`${TOPOLOGY.racks} racks · ${TOPOLOGY.racks * TOPOLOGY.modulesPerRack} modules`}
          />
          <InfoCell
            icon={IconEnergy}
            label="Rated capacity"
            value={`${telemetry.ratedEnergyKwh.toLocaleString()} kWh`}
            mono
          />
        </dl>

        <DataSourceDisclosure />
      </Panel>

      <SystemConfigDialog
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        device={device}
      />
    </>
  );
}

/* -----------------------------------------------------------------------------
   InfoCell
   -------------------------------------------------------------------------- */

function InfoCell({
  icon: Icon,
  label,
  value,
  emphasis = false,
  mono = false,
  muted = false,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string;
  emphasis?: boolean;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="bg-surface px-5 py-4 min-w-0">
      <span className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} className="text-ink-4 shrink-0" />
        <span className="label-technical truncate">{label}</span>
      </span>
      <span
        className={`block truncate ${mono ? 'data-technical' : ''} ${
          emphasis ? 'text-[16px] font-semibold' : 'text-[13.5px] font-medium'
        } ${muted ? 'text-ink-4 italic' : 'text-ink'}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   DataSourceDisclosure

   Makes the simulation boundary visible in the product rather than burying it
   in a hand-off document. A reviewer can see at a glance which figures are
   backed by the schema today and which are waiting on it.
   -------------------------------------------------------------------------- */

function DataSourceDisclosure() {
  const [open, setOpen] = useState(false);

  const pending = TELEMETRY_PROVENANCE.filter((f) => f.provenance !== 'mapped').length;

  return (
    <div className="border-t border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-5 py-3 text-left cursor-pointer
          hover:bg-surface-2 transition-colors duration-150
          focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      >
        <IconInfo size={13} className="text-ink-4 shrink-0" />
        <span className="text-[12.5px] text-ink-2 flex-1">
          Data sources
          <span className="text-ink-4"> · {pending} metrics awaiting backend fields</span>
        </span>
        <IconChevronDown
          size={13}
          className={`text-ink-4 shrink-0 transition-transform duration-200
            [transition-timing-function:var(--ease-precise)] ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul className="divide-y divide-line border-t border-line animate-fade-in">
          {TELEMETRY_PROVENANCE.map((field) => (
            <li key={field.label} className="px-5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-ink">{field.label}</p>
                  <p className="data-technical text-[11px] text-ink-4 mt-1 truncate">
                    {field.backingField}
                  </p>
                  {field.note && (
                    <p className="text-[11.5px] text-ink-3 mt-1.5 leading-relaxed">{field.note}</p>
                  )}
                </div>
                <Badge
                  tone={
                    field.provenance === 'mapped'
                      ? 'ok'
                      : field.provenance === 'derived'
                        ? 'info'
                        : 'warn'
                  }
                  size="xs"
                  className="shrink-0 mt-0.5"
                >
                  {field.provenance}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------------------
   SystemConfigDialog

   Built to its finished shape. The write path is deliberately inert — see the
   note in the footer — because faking a save would be worse than not offering
   one.
   -------------------------------------------------------------------------- */

function SystemConfigDialog({
  isOpen,
  onClose,
  device,
}: {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
}) {
  const [name, setName] = useState(device.name);
  const [location, setLocation] = useState(device.location ?? '');
  const [deviceType, setDeviceType] = useState(device.device_type ?? '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure system"
      description="Identity and siting details for this installation."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled
            title="Persisting these values requires a device update endpoint"
          >
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <InputField
          id="system-name"
          label="Device name"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          autocomplete="off"
        />
        <InputField
          id="system-location"
          label="Location"
          value={location}
          onChange={(e: any) => setLocation(e.target.value)}
          autocomplete="off"
        />
        <InputField
          id="system-type"
          label="Device type"
          value={deviceType}
          onChange={(e: any) => setDeviceType(e.target.value)}
          autocomplete="off"
        />

        <div
          role="note"
          className="flex items-start gap-2.5 px-3.5 py-3 rounded-md bg-info-surface border border-info-line"
        >
          <IconInfo size={14} className="text-info-ink shrink-0 mt-0.5" />
          <p className="text-[12px] text-info-ink leading-relaxed">
            <span className="font-semibold">Saving is not yet connected.</span> The columns exist
            (<span className="data-technical">devices.name</span>,{' '}
            <span className="data-technical">devices.location</span>,{' '}
            <span className="data-technical">devices.device_type</span>) but this build reads from
            local mock data and has no update mutation. The form is left editable so the intended
            flow can be reviewed.
          </p>
        </div>
      </div>
    </Modal>
  );
}
