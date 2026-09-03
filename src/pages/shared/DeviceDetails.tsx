import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/ui/Tabs';
import { LiveDot } from '../../components/ui/Badge';
import { Device, DeviceCurrentData } from '../../types/database.types';
import { useDeviceRealtime } from '../../hooks/useDeviceRealtime';
import { getSystemTelemetry } from '../../data/bmsTelemetry';
import { OperatingStateBadge } from '../../components/bms/OperatingState';
import { FaultBanner } from '../../components/bms/FaultBanner';
import DeviceLocation from '../../components/bms/DeviceLocation';
import {
  IconArrowLeft,
  IconDevice,
  IconRack,
  IconPack,
  IconTrend,
  IconCellGrid,
  IconHistory,
  IconWarning,
} from '../../components/icons';

// BMS Components
import { BmsOverview } from '../../components/bms/BmsOverview';
import { RackOverview } from '../../components/bms/RackOverview';
import { CellOverview } from '../../components/bms/CellOverview';
import { BmsHistory } from '../../components/bms/BmsHistory';
import { BmsAlerts } from '../../components/bms/BmsAlerts';

type Tab = 'overview' | 'racks' | 'cells' | 'history' | 'alerts';

type WorkspaceTab = {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  count?: number;
  tone?: 'default' | 'warn' | 'crit';
};

/* =============================================================================
   DeviceDetails — the BMS workspace

   The header is the workspace's fixed frame of reference: which unit this is,
   where it is, whether it is reporting, what it is doing right now, and its
   headline condition. It stays identical across tabs so switching views never
   costs the reader their place.

   Navigation follows the hardware hierarchy — device → rack → module → cell.
   Cell Overview is not a primary destination: the company marked it as future
   use, so it is kept out of the tab bar and reached only by drilling into a
   module from Rack Overview. The route and the component are untouched.
   ========================================================================== */

/** Cells is deliberately absent — see the note above. */
const PRIMARY_TABS: WorkspaceTab[] = [
  { id: 'overview', label: 'Overview', icon: IconTrend },
  { id: 'racks', label: 'Racks', icon: IconRack },
  { id: 'history', label: 'History', icon: IconHistory },
  { id: 'alerts', label: 'Alerts', icon: IconWarning },
];

const CELLS_TAB: WorkspaceTab = { id: 'cells', label: 'Cells', icon: IconCellGrid };

export default function DeviceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>();

  // Mock device data repository
  const MOCK_DEVICES: Device[] = [
    { id: '1', customer_id: '1', device_identifier: 'BMS-A001', name: 'Main HQ Battery', device_type: 'BMS V1', location: 'New York', status: 'active', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', customer_id: '2', device_identifier: 'BMS-A002', name: 'Branch 1 Backup', device_type: 'BMS V2', location: 'Boston', status: 'active', last_seen_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  // Resolve device based on route parameter
  const device = MOCK_DEVICES.find((d) => d.id === id) || MOCK_DEVICES[0];

  const initialCurrentData: DeviceCurrentData = {
    id: '1',
    device_id: device.id,
    received_at: new Date().toISOString(),
    temperature: 24.5,
    humidity: 52,
    voltage: 230,
    current: 4.2,
    power: 966,
    status: 'Normal',
    raw_data: null,
    updated_at: new Date().toISOString(),
  };

  /* The realtime subscription is preserved. Its payload drives the link
     freshness indicator; the pack figures come from the telemetry model so that
     system and rack numbers stay consistent with each other. */
  const { data: liveData } = useDeviceRealtime(device.id, initialCurrentData);

  const telemetry = useMemo(() => getSystemTelemetry(device.id), [device.id]);

  const activeFaults = useMemo(
    () => telemetry.racks.filter((rack) => rack.fault).length,
    [telemetry],
  );

  /* Cells joins the tab bar only while it is the active view, so drilling in
     from a module still shows the user where they are. */
  const tabs = useMemo<WorkspaceTab[]>(() => {
    const alerts: WorkspaceTab = {
      ...PRIMARY_TABS[3],
      count: activeFaults,
      tone: telemetry.fault?.severity === 'fault' ? 'crit' : 'warn',
    };
    const base = [PRIMARY_TABS[0], PRIMARY_TABS[1], PRIMARY_TABS[2], alerts];
    if (activeTab === 'cells') base.splice(2, 0, CELLS_TAB);
    return base;
  }, [activeTab, activeFaults, telemetry.fault]);

  return (
    <DashboardLayout>
      <div>
        {/* ------------------------------------------------ Device context */}
        <header className="mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 mb-4 -ml-1 px-1 py-1 rounded
              label-technical hover:text-ink transition-colors cursor-pointer
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <IconArrowLeft
              size={12}
              className="transition-transform duration-150 group-hover:-translate-x-0.5"
            />
            Back to devices
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[28px] leading-tight font-semibold text-ink tracking-[-0.025em]">
                  {device.name}
                </h1>
                <StatusBadge lastSeenAt={device.last_seen_at} status={device.status} />
                <OperatingStateBadge state={telemetry.state} />
              </div>

              {/* Location is given its own line at body scale rather than being
                  one entry in a metadata rail — an operator needs to know which
                  site they are looking at before anything else. It is also the
                  entry point to the (pending) geofencing map. */}
              <div className="mt-2.5">
                <DeviceLocation
                  location={device.location}
                  deviceName={device.name}
                  deviceIdentifier={device.device_identifier}
                  variant="header"
                />
              </div>

              <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3.5">
                <MetaItem icon={IconDevice} label="Identifier" value={device.device_identifier} />
                <MetaItem icon={IconPack} label="Type" value={device.device_type ?? '—'} />
                <MetaItem
                  icon={IconRack}
                  label="Configuration"
                  value={`${telemetry.racks.length} racks · ${telemetry.racks.reduce(
                    (n, r) => n + r.modules.length,
                    0,
                  )} modules`}
                />
              </dl>
            </div>

            {/* Headline condition.
                A grid rather than a row: at 390px four cells cannot sit side by
                side, and clipping the last one would hide the link state. The
                gap-px over a line-coloured ground draws the dividers, so the
                rule stays correct however the grid wraps. */}
            <div
              className="shrink-0 rounded-[10px] border border-line bg-line shadow-[var(--shadow-e1)]
                overflow-hidden grid grid-cols-2 sm:grid-cols-4 gap-px"
            >
              <SummaryCell label="State of charge" value={telemetry.soc.toFixed(1)} unit="%" />
              <SummaryCell label="State of health" value={telemetry.soh.toFixed(1)} unit="%" />
              <SummaryCell
                label="Battery voltage"
                value={telemetry.batteryVoltage.toFixed(1)}
                unit="V"
              />
              <div className="bg-surface px-4 py-3 flex flex-col justify-center gap-1.5 min-w-[110px]">
                <span className="label-technical">Telemetry</span>
                <span className="flex items-center gap-2">
                  <LiveDot tone={liveData ? 'ok' : 'idle'} size={6} live={Boolean(liveData)} />
                  <span className="text-[12.5px] font-medium text-ink">
                    {liveData ? 'Streaming' : 'No link'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ------------------------------------------------ Active fault */}
        <FaultBanner fault={telemetry.fault} className="mb-5" />

        {/* ------------------------------------------------ Workspace tabs */}
        <Tabs
          tabs={tabs}
          active={activeTab}
          onChange={(id) => setActiveTab(id as Tab)}
          className="mb-6"
        />

        {/* ------------------------------------------------ Selected view */}
        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'overview' && <BmsOverview deviceId={device.id} device={device} />}
          {activeTab === 'racks' && (
            <RackOverview
              deviceId={device.id}
              onModuleSelect={(moduleId) => {
                setSelectedModuleId(moduleId);
                setActiveTab('cells');
              }}
            />
          )}
          {activeTab === 'cells' && (
            <CellOverview deviceId={device.id} moduleId={selectedModuleId} />
          )}
          {activeTab === 'history' && <BmsHistory deviceId={device.id} />}
          {activeTab === 'alerts' && <BmsAlerts deviceId={device.id} />}
        </div>
      </div>
    </DashboardLayout>
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

function SummaryCell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-surface px-4 py-3 flex flex-col justify-center gap-1.5 min-w-[104px]">
      <span className="label-technical">{label}</span>
      <span className="flex items-baseline gap-0.5">
        <span className="data-technical text-[19px] font-medium text-ink leading-none">{value}</span>
        <span className="text-[11px] text-ink-4">{unit}</span>
      </span>
    </div>
  );
}
