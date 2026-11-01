import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import ChartCard from '../../components/ChartCard';
import { LiveDot } from '../../components/ui/Badge';
import { Panel } from '../../components/ui/Panel';
import { chartColors } from '../../components/ui/chartTheme';
import { relativeTime } from '../../components/tableCells';
import { Device, TelemetryPoint } from '../../types/database.types';
import { useDeviceRealtime } from '../../hooks/useDeviceRealtime';
import { api } from '../../lib/api';
import {
  IconArrowLeft,
  IconDevice,
  IconPack,
  IconCustomers,
  IconLocation,
  IconClock,
} from '../../components/icons';

/* =============================================================================
   DeviceDetails

   Everything on this page comes from the device's own telemetry, matched to it
   by the IMEI in each MQTT message. Nothing is generated client-side: a reading
   the device has not sent is shown as a dash, not as a plausible number.

   Rack, module and cell views return once the CAN decoder supplies that data.
   ========================================================================== */

/** A device that has not reported for this long is shown as not streaming. */
const STALE_MS = 30_000;
const HISTORY_POINTS = 120;

const fmt = (v: number | null | undefined, digits = 1) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(digits);

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function DeviceDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const { data: live } = useDeviceRealtime(id);

  useEffect(() => {
    api<Device>(`/api/devices/${encodeURIComponent(id)}`)
      .then(setDevice)
      .catch((e) => setDeviceError(e instanceof Error ? e.message : 'Could not load device'));
  }, [id]);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      api<TelemetryPoint[]>(`/api/devices/${encodeURIComponent(id)}/telemetry/history?limit=${HISTORY_POINTS}`)
        .then((rows) => { if (alive) setHistory(rows); })
        .catch(() => {});
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [id]);

  const lastSeen = live?.received_at ?? device?.last_seen_at ?? null;
  const streaming = !!live && Date.now() - new Date(live.received_at).getTime() < STALE_MS;
  const labels = history.map((p) => timeLabel(p.received_at));
  const series = (key: keyof Omit<TelemetryPoint, 'received_at'>) => history.map((p) => p[key] ?? NaN);

  if (deviceError) {
    return (
      <DashboardLayout>
        <BackButton onClick={() => navigate(-1)} />
        <p role="alert" className="text-[14px] text-crit-ink">{deviceError}</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <header className="mb-6">
        <BackButton onClick={() => navigate(-1)} />

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] leading-tight font-semibold text-ink tracking-[-0.025em]">
            {device?.name ?? 'Loading device…'}
          </h1>
          {device && <StatusBadge lastSeenAt={lastSeen} status={device.status} />}
        </div>

        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3.5">
          <MetaItem icon={IconDevice} label="IMEI" value={device?.device_identifier ?? '—'} />
          <MetaItem icon={IconCustomers} label="Customer" value={device?.customer_name ?? '—'} />
          <MetaItem icon={IconLocation} label="Location" value={device?.location ?? '—'} />
          <MetaItem icon={IconPack} label="Type" value={device?.device_type ?? '—'} />
          <MetaItem icon={IconClock} label="Last message" value={relativeTime(lastSeen)} />
        </dl>
      </header>

      {/* ------------------------------------------------ Live readings */}
      <section aria-label="Live readings" className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <LiveDot tone={streaming ? 'ok' : 'idle'} size={6} live={streaming} />
          <span className="label-technical">
            {streaming ? 'Streaming live' : live ? 'Not reporting' : 'Waiting for first message'}
          </span>
        </div>
        <div
          className="rounded-[10px] border border-line bg-line shadow-[var(--shadow-e1)]
            overflow-hidden grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px"
        >
          <ReadingCell label="State of charge" value={fmt(live?.soc)} unit="%" />
          <ReadingCell label="State of health" value={fmt(live?.soh)} unit="%" />
          <ReadingCell label="Pack voltage" value={fmt(live?.voltage)} unit="V" />
          <ReadingCell label="Current" value={fmt(live?.current, 2)} unit="A" />
          <ReadingCell label="Power" value={fmt(live?.power, 0)} unit="W" />
          <ReadingCell label="Temperature" value={fmt(live?.temperature)} unit="°C" />
        </div>
      </section>

      {/* ------------------------------------------------ Recent trend */}
      {history.length > 1 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ChartCard title="Pack voltage" type="line" unit="Voltage (V)" xLabel="Time" labels={labels} data={series('voltage')} color={chartColors.info} />
          <ChartCard title="Current" type="line" unit="Current (A)" xLabel="Time" labels={labels} data={series('current')} color={chartColors.violet} zeroLine />
          <ChartCard title="State of charge" type="line" unit="SoC (%)" xLabel="Time" labels={labels} data={series('soc')} color={chartColors.ok} />
          <ChartCard title="Temperature" type="line" unit="Temperature (°C)" xLabel="Time" labels={labels} data={series('temperature')} color={chartColors.warn} />
        </div>
      ) : (
        <Panel className="p-8 text-center">
          <p className="text-[14px] font-medium text-ink">No telemetry yet</p>
          <p className="mt-1.5 text-[13px] text-ink-3">
            Trends appear once the LTE module with IMEI {device?.device_identifier ?? '—'} starts sending messages.
          </p>
        </Panel>
      )}
    </DashboardLayout>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 mb-4 -ml-1 px-1 py-1 rounded
        label-technical hover:text-ink transition-colors cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <IconArrowLeft size={12} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
      Back to devices
    </button>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon size={13} className="text-ink-4 shrink-0" />
      <dt className="label-technical">{label}</dt>
      <dd className="data-technical text-[12.5px] text-ink-2 truncate">{value}</dd>
    </div>
  );
}

function ReadingCell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-surface px-4 py-3.5 flex flex-col justify-center gap-1.5">
      <span className="label-technical">{label}</span>
      <span className="flex items-baseline gap-0.5">
        <span className="data-technical text-[22px] font-medium text-ink leading-none">{value}</span>
        <span className="text-[11px] text-ink-4">{unit}</span>
      </span>
    </div>
  );
}
