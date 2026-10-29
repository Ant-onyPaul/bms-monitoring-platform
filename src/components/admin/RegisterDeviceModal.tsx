import React, { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../InputField';
import { Badge } from '../ui/Badge';
import { IconSearch, IconRefresh, IconCheck, IconClose, IconInfo, IconWarning } from '../icons';
import { Device, Role } from '../../types/database.types';
import { canRegisterDevices } from '../../utils/devicePermissions';
import {
  ImeiSource,
  findDeviceWithImei,
  normaliseImeiInput,
  validateImei,
} from '../../utils/imei';
import {
  DemoImeiDiscoveryService,
  ImeiDiscoveryResult,
  ImeiDiscoveryService,
  isAbortError,
} from '../../services/imeiDiscovery';

interface RegisterDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (device: Device) => void;
  role: Role | null | undefined;
  /** Devices already on the platform, for duplicate checks. */
  existingDevices: Device[];
  /** Pre-scopes the device to a customer; otherwise a Customer ID is asked for. */
  customerId?: string;
  /** Override the discovery backend. Defaults to a fresh demo simulation per open. */
  createDiscoveryService?: () => ImeiDiscoveryService;
}

type Discovery =
  | { status: 'idle' }
  | { status: 'detecting' }
  | { status: 'awaiting-confirmation'; result: ImeiDiscoveryResult }
  | { status: 'cancelled'; message: string }
  | { status: 'error'; message: string };

const createDemoService = () => new DemoImeiDiscoveryService();

/* -----------------------------------------------------------------------------
   RegisterDeviceModal

   Device onboarding. The IMEI is its own field, separate from the platform's
   Device ID. "Detect IMEI" goes through `ImeiDiscoveryService`; until a backend
   MQTT listener exists that service is a simulation, so its result is labelled
   DEMO and must be explicitly confirmed before it is associated with the device.
   -------------------------------------------------------------------------- */

export default function RegisterDeviceModal({
  isOpen,
  onClose,
  onSubmit,
  role,
  existingDevices,
  customerId,
  createDiscoveryService = createDemoService,
}: RegisterDeviceModalProps) {
  const [name, setName] = useState('');
  const [deviceIdentifier, setDeviceIdentifier] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [location, setLocation] = useState('');
  const [customer, setCustomer] = useState('');
  const [imei, setImei] = useState('');
  const [imeiSource, setImeiSource] = useState<ImeiSource>('manual');
  const [discovery, setDiscovery] = useState<Discovery>({ status: 'idle' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceRef = useRef<ImeiDiscoveryService | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset on open; abort any in-flight discovery on close.
  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setDeviceIdentifier('');
    setDeviceType('');
    setLocation('');
    setCustomer('');
    setImei('');
    setImeiSource('manual');
    setDiscovery({ status: 'idle' });
    setIsSubmitting(false);
    serviceRef.current = createDiscoveryService();
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const authorized = canRegisterDevices(role);

  const handleDetect = async () => {
    if (!serviceRef.current) serviceRef.current = createDiscoveryService();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setDiscovery({ status: 'detecting' });

    try {
      const result = await serviceRef.current.discover(controller.signal);
      if (controller.signal.aborted) return;
      setDiscovery({ status: 'awaiting-confirmation', result });
    } catch (err) {
      if (isAbortError(err)) return;
      setDiscovery({
        status: 'error',
        message: err instanceof Error ? err.message : 'IMEI discovery failed.',
      });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const handleCancelDetect = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setDiscovery({ status: 'cancelled', message: 'Detection cancelled. No IMEI was associated.' });
  };

  const handleDiscard = () => {
    setDiscovery({ status: 'cancelled', message: 'Detected value discarded. No IMEI was associated.' });
  };

  const handleConfirm = (result: ImeiDiscoveryResult) => {
    setImei(result.identifier);
    setImeiSource(result.source);
    setDiscovery({ status: 'idle' });
  };

  const handleClearImei = () => {
    setImei('');
    setImeiSource('manual');
    setDiscovery({ status: 'idle' });
  };

  const trimmedIdentifier = deviceIdentifier.trim();
  const resolvedCustomer = customerId ?? customer.trim();

  const identifierTaken = existingDevices.some(
    (d) => d.device_identifier.toLowerCase() === trimmedIdentifier.toLowerCase(),
  );
  const imeiOwner = findDeviceWithImei(imei, existingDevices);
  const imeiError =
    validateImei(imei, imeiSource) ??
    (imeiOwner ? `Already assigned to ${imeiOwner.name} (${imeiOwner.device_identifier}).` : null);
  const identifierError = identifierTaken
    ? 'A device with this Device ID already exists. Existing identifiers are never overwritten.'
    : null;

  const pendingDetection = discovery.status === 'detecting' || discovery.status === 'awaiting-confirmation';
  const canSubmit =
    authorized &&
    name.trim() !== '' &&
    trimmedIdentifier !== '' &&
    resolvedCustomer !== '' &&
    !identifierError &&
    !imeiError &&
    !pendingDetection &&
    !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    const now = new Date().toISOString();
    onSubmit({
      id: `local-${Date.now().toString(36)}`,
      customer_id: resolvedCustomer,
      device_identifier: trimmedIdentifier,
      name: name.trim(),
      device_type: deviceType.trim() || null,
      location: location.trim() || null,
      status: 'inactive',
      last_seen_at: null,
      created_at: now,
      updated_at: now,
      imei: imei || null,
      imei_source: imei ? imeiSource : null,
    });
    setIsSubmitting(false);
    onClose();
  };

  if (!authorized) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Register device">
        <p className="text-[13px] text-ink-2 leading-relaxed">
          Your role does not have permission to register devices.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register device"
      description="Adds a battery management unit to the platform."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="register-device-form"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Registering…"
            disabled={!canSubmit}
          >
            Register device
          </Button>
        </>
      }
    >
      <form id="register-device-form" onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="deviceName"
          label="Device Name"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          required
          autocomplete="off"
        />

        <InputField
          id="deviceIdentifier"
          label="Device ID"
          value={deviceIdentifier}
          onChange={(e: any) => setDeviceIdentifier(e.target.value)}
          error={identifierError ?? undefined}
          required
          autocomplete="off"
        />

        {!customerId && (
          <InputField
            id="deviceCustomer"
            label="Customer ID"
            value={customer}
            onChange={(e: any) => setCustomer(e.target.value)}
            required
            autocomplete="off"
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="deviceType"
            label="Type"
            value={deviceType}
            onChange={(e: any) => setDeviceType(e.target.value)}
            autocomplete="off"
          />
          <InputField
            id="deviceLocation"
            label="Location"
            value={location}
            onChange={(e: any) => setLocation(e.target.value)}
            autocomplete="off"
          />
        </div>

        {/* IMEI */}
        <div className="pt-2">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="label-technical">IMEI (optional)</span>
            {imeiSource === 'demo-simulation' && imei && (
              <Badge tone="warn" size="xs">DEMO — Simulated IMEI</Badge>
            )}
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <InputField
                id="deviceImei"
                label="IMEI"
                value={imei}
                onChange={(e: any) => {
                  setImei(normaliseImeiInput(e.target.value));
                  setImeiSource('manual');
                }}
                readOnly={imeiSource === 'demo-simulation'}
                error={imeiError ?? undefined}
                inputMode="numeric"
                autocomplete="off"
              />
            </div>
            {imei ? (
              <Button className="mt-[9px]" icon={IconClose} onClick={handleClearImei}>
                Clear
              </Button>
            ) : (
              <Button
                className="mt-[9px]"
                icon={IconSearch}
                onClick={handleDetect}
                isLoading={discovery.status === 'detecting'}
                loadingText="Detecting…"
                disabled={discovery.status === 'awaiting-confirmation'}
              >
                Detect IMEI
              </Button>
            )}
          </div>

          <DiscoveryPanel
            discovery={discovery}
            existingDevices={existingDevices}
            onCancel={handleCancelDetect}
            onRetry={handleDetect}
            onDiscard={handleDiscard}
            onConfirm={handleConfirm}
          />
        </div>

        <p className="flex items-start gap-2 text-[11.5px] text-ink-3 leading-snug">
          <IconInfo size={13} className="shrink-0 mt-px" />
          Demo mode: no device backend is connected, so this registration is kept on this page only.
          It is not saved and will be lost when you navigate away or reload.
        </p>
      </form>
    </Modal>
  );
}

function DiscoveryPanel({
  discovery,
  existingDevices,
  onCancel,
  onRetry,
  onDiscard,
  onConfirm,
}: {
  discovery: Discovery;
  existingDevices: Device[];
  onCancel: () => void;
  onRetry: () => void;
  onDiscard: () => void;
  onConfirm: (result: ImeiDiscoveryResult) => void;
}) {
  if (discovery.status === 'idle') return null;

  const shell = 'mt-3 rounded-md border border-line-2 bg-surface-2 px-4 py-3 animate-fade-in';

  if (discovery.status === 'detecting') {
    return (
      <div className={`${shell} flex items-center justify-between gap-3`} role="status">
        <p className="text-[12.5px] text-ink-2">Running simulated discovery (demo — no device is contacted)…</p>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  if (discovery.status === 'cancelled' || discovery.status === 'error') {
    const isError = discovery.status === 'error';
    return (
      <div className={`${shell} flex items-center justify-between gap-3`} role={isError ? 'alert' : 'status'}>
        <p className={`flex items-center gap-2 text-[12.5px] ${isError ? 'text-crit-ink' : 'text-ink-2'}`}>
          {isError && <IconWarning size={13} className="shrink-0" />}
          {discovery.message}
        </p>
        <Button size="sm" icon={IconRefresh} onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  const { result } = discovery;
  const owner = findDeviceWithImei(result.identifier, existingDevices);

  return (
    <div className={shell} role="status">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="label-technical">Detected value</span>
        {result.isDemo && <Badge tone="warn" size="xs">DEMO — Simulated IMEI</Badge>}
      </div>
      <code className="block data-technical text-[17px] font-semibold text-ink tracking-[0.02em] select-all">
        {result.identifier}
      </code>
      {result.isDemo && (
        <p className="mt-1.5 text-[11.5px] text-ink-3 leading-snug">
          Simulated value. No physical device or MQTT message was detected. This is not a real IMEI.
        </p>
      )}

      {owner ? (
        <p role="alert" className="mt-2.5 flex items-center gap-2 text-[12px] font-medium text-crit-ink">
          <IconWarning size={13} className="shrink-0" />
          Already assigned to {owner.name} ({owner.device_identifier}). It cannot be associated again.
        </p>
      ) : (
        <p className="mt-2.5 text-[12.5px] text-ink-2">Associate this identifier with the new device?</p>
      )}

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
        <Button size="sm" icon={IconRefresh} onClick={onRetry}>
          Detect again
        </Button>
        <Button size="sm" variant="primary" icon={IconCheck} onClick={() => onConfirm(result)} disabled={!!owner}>
          Confirm
        </Button>
      </div>
    </div>
  );
}

/** Shown on device lists once something was registered in this session. */
export function UnsavedRegistrationsNotice({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <p className="mb-5 flex items-start gap-2 rounded-md border border-warn-line bg-warn-surface px-4 py-2.5 text-[12.5px] text-warn-ink">
      <IconInfo size={14} className="shrink-0 mt-px" />
      {count === 1 ? '1 device was' : `${count} devices were`} registered in demo mode. No backend is
      connected, so {count === 1 ? 'it is' : 'they are'} not saved and will disappear on reload.
    </p>
  );
}
