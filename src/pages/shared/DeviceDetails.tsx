import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/ui/Tabs';
import { LiveDot } from '../../components/ui/Badge';
import { Device, DeviceCurrentData } from '../../types/database.types';
import { useDeviceRealtime } from '../../hooks/useDeviceRealtime';
import {
  IconArrowLeft,
  IconDevice,
  IconLocation,
  IconRack,
  IconCharge,
  IconTrend,
  IconModule,
  IconCellGrid,
  IconHistory,
  IconWarning,
} from '../../components/icons';

// BMS Components
import { BmsOverview } from '../../components/bms/BmsOverview';
import { ModuleOverview } from '../../components/bms/ModuleOverview';
import { CellOverview } from '../../components/bms/CellOverview';
import { BmsHistory } from '../../components/bms/BmsHistory';
import { BmsAlerts } from '../../components/bms/BmsAlerts';

type Tab = 'overview' | 'modules' | 'cells' | 'history' | 'alerts';

/* =============================================================================
   DeviceDetails — the BMS workspace

   The header is the workspace's fixed frame of reference: which unit is open,
   whether it is reporting, and its headline condition. It stays identical
   across all five tabs so switching views never costs the reader their place.
   ========================================================================== */

const WORKSPACE_TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  count?: number;
  tone?: 'default' | 'warn' | 'crit';
}[] = [
  { id: 'overview', label: 'Overview', icon: IconTrend },
  { id: 'modules', label: 'Modules', icon: IconModule },
  { id: 'cells', label: 'Cells', icon: IconCellGrid },
  { id: 'history', label: 'History', icon: IconHistory },
  { id: 'alerts', label: 'Alerts', icon: IconWarning, count: 2, tone: 'crit' },
];

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

  useDeviceRealtime(device.id, initialCurrentData);

  return (
    <DashboardLayout>
      <div>
        {/* ------------------------------------------------ Device context */}
        <header className="mb-6">
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
              </div>

              {/* Identity rail */}
              <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                <MetaItem icon={IconDevice} label="Identifier" value={device.device_identifier} />
                <MetaItem icon={IconLocation} label="Location" value={device.location ?? '—'} />
                <MetaItem icon={IconRack} label="Type" value={device.device_type ?? '—'} />
                <MetaItem icon={IconCharge} label="Configuration" value="4 racks · 48 modules" />
              </dl>
            </div>

            {/* Headline condition */}
            <div className="flex items-stretch shrink-0 rounded-[10px] border border-line bg-surface shadow-[var(--shadow-e1)] overflow-hidden">
              <SummaryCell label="State of charge" value="82" unit="%" />
              <SummaryCell label="Health" value="97" unit="%" />
              <div className="px-4 py-3 flex flex-col justify-center gap-1.5 min-w-[110px]">
                <span className="label-technical">Telemetry</span>
                <span className="flex items-center gap-2">
                  <LiveDot tone="ok" size={6} live />
                  <span className="text-[12.5px] font-medium text-ink">Streaming</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ------------------------------------------------ Workspace tabs */}
        <Tabs
          tabs={WORKSPACE_TABS}
          active={activeTab}
          onChange={(id) => setActiveTab(id as Tab)}
          className="mb-6"
        />

        {/* ------------------------------------------------ Selected view */}
        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'overview' && <BmsOverview deviceId={device.id} />}
          {activeTab === 'modules' && (
            <ModuleOverview
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
    <div className="px-4 py-3 border-r border-line flex flex-col justify-center gap-1.5 min-w-[104px]">
      <span className="label-technical">{label}</span>
      <span className="flex items-baseline gap-0.5">
        <span className="data-technical text-[19px] font-medium text-ink leading-none">{value}</span>
        <span className="text-[11px] text-ink-4">{unit}</span>
      </span>
    </div>
  );
}
