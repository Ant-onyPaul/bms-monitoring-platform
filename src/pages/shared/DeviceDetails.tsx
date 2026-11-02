import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import { Badge, LiveDot } from '../../components/ui/Badge';
import { Panel } from '../../components/ui/Panel';
import { relativeTime } from '../../components/tableCells';
import DeviceLocation from '../../components/bms/DeviceLocation';
import { BmsOverview } from '../../components/bms/BmsOverview';
import { RackOverview } from '../../components/bms/RackOverview';
import { ModuleOverview } from '../../components/bms/ModuleOverview';
import { CellOverview } from '../../components/bms/CellOverview';
import { BmsHistory } from '../../components/bms/BmsHistory';
import { BmsAlerts } from '../../components/bms/BmsAlerts';
import { DataUnavailable } from '../../components/bms/DataUnavailable';
import { DemoDataNotice, DemoFrame } from '../../components/bms/DemoDataNotice';
import { FaultBanner } from '../../components/bms/FaultBanner';
import { OperatingStateBadge } from '../../components/bms/OperatingState';
import { useDeviceWorkspace } from '../../services/deviceData/useDeviceWorkspace';
import { DEMO_MODE } from '../../services/deviceData/demoMode';
import {
  BACKEND_REQUIREMENTS,
  LIVE_SECTIONS,
  buildLiveHistory,
  buildLiveOverview,
  isStreaming,
} from '../../services/deviceData/liveAdapters';
import type { HistoryRangeId, SectionId } from '../../services/deviceData/types';
import {
  IconArrowLeft,
  IconDevice,
  IconRack,
  IconPack,
  IconTrend,
  IconCellGrid,
  IconHistory,
  IconWarning,
  IconModule,
  IconCustomers,
  IconClock,
  IconEye,
} from '../../components/icons';

type DemoSource = typeof import('../../services/deviceData/demoSource');

type WorkspaceTab = {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
};

/* =============================================================================
   DeviceDetails — the BMS workspace

   The header is the workspace's fixed frame of reference: which unit this is,
   where it is, whether it is reporting, and its headline condition. It stays
   identical across tabs so switching views never costs the reader their place,
   and it only ever shows live data.

   Navigation follows the hardware hierarchy — device → rack → module → cell —
   then History and Alerts.

   Data: every tab renders from the live API (services/deviceData). A section
   the API does not serve yet shows an empty state that names what is needed.
   "Preview layout with demo data" swaps the current tab — and only it — for
   the original layout filled from the demo source, under a SIMULATED banner and
   frame. Changing tab or reloading ends the preview; it never starts by itself.

   DEMO_MODE (local dev server with the dev demo backend only; constant false in
   every production build) renders the original workspace in full from the
   simulation — header figures, fault banner, operating state, location map and
   all six tabs — since the whole app is then a demo under the SIMULATED ribbon.
   ========================================================================== */

const TABS: WorkspaceTab[] = [
  { id: 'overview', label: 'Overview', icon: IconTrend },
  { id: 'racks', label: 'Racks', icon: IconRack },
  { id: 'modules', label: 'Modules', icon: IconModule },
  { id: 'cells', label: 'Cells', icon: IconCellGrid },
  { id: 'history', label: 'History', icon: IconHistory },
  { id: 'alerts', label: 'Alerts', icon: IconWarning },
];

const UNAVAILABLE_COPY: Record<'racks' | 'modules' | 'cells' | 'alerts', { title: string; message: string; icon: WorkspaceTab['icon'] }> = {
  racks: {
    title: 'Rack data is not available yet',
    message: 'The device API reports pack-level telemetry only. Rack status, measurements and cell extremes appear here once the backend provides them.',
    icon: IconRack,
  },
  modules: {
    title: 'Module data is not available yet',
    message: 'Modules are listed per rack, so this view needs the same rack data as the Racks tab.',
    icon: IconModule,
  },
  cells: {
    title: 'Cell data is not available yet',
    message: 'Per-cell voltages, balancing state and module probe temperatures appear here once the backend provides them.',
    icon: IconCellGrid,
  },
  alerts: {
    title: 'Device alerts are not available yet',
    message: 'The API does not report faults, warnings or events for individual devices yet.',
    icon: IconWarning,
  },
};

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const fixed = (value: number | null | undefined, digits = 1) =>
  value === null || value === undefined || !Number.isFinite(value) ? '—' : value.toFixed(digits);

export default function DeviceDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { device, deviceError, live, history } = useDeviceWorkspace(id);

  const [activeTab, setActiveTab] = useState<SectionId>('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>();
  const [preview, setPreview] = useState(false);
  const [demo, setDemo] = useState<DemoSource | null>(null);
  const [historyRange, setHistoryRange] = useState<HistoryRangeId>('24h');

  /* The simulation is a separate chunk, fetched the first time a preview is
     asked for (or straight away in demo mode) — the live workspace never loads it. */
  useEffect(() => {
    if (!(preview || DEMO_MODE) || demo) return;
    import('../../services/deviceData/demoSource')
      .then((module) => setDemo(module))
      .catch(() => setPreview(false));
  }, [preview, demo]);

  const changeTab = (tab: SectionId) => {
    setActiveTab(tab);
    setPreview(false);
  };

  /* Drilling from a module into its cells stays inside the current preview. */
  const openModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setActiveTab('cells');
  };

  const liveOverview = useMemo(
    () => buildLiveOverview({ live, history, now: Date.now(), formatAge: relativeTime, formatTime: timeLabel }),
    [live, history],
  );
  const liveHistory = useMemo(() => buildLiveHistory(history, timeLabel), [history]);

  const deviceKey = device?.id ?? id;
  const demoRacks = useMemo(() => (demo ? demo.buildDemoRacks(deviceKey) : null), [demo, deviceKey]);
  const demoHeader = useMemo(
    () => (DEMO_MODE && demo && device ? demo.buildDemoHeader(deviceKey, device.device_identifier) : null),
    [demo, device, deviceKey],
  );

  if (deviceError) {
    return (
      <DashboardLayout>
        <BackButton onClick={() => navigate(-1)} />
        <p role="alert" className="text-[14px] text-crit-ink">{deviceError}</p>
      </DashboardLayout>
    );
  }

  const lastSeen = live?.received_at ?? device?.last_seen_at ?? null;
  const streaming = isStreaming(live, Date.now());
  const deviceLabel = device?.name;
  const isTestData = !DEMO_MODE && Boolean(live?.raw_data?.test_only);

  const previewing = (preview || DEMO_MODE) && demo !== null;

  const tabs = demoHeader
    ? TABS.map((tab) =>
        tab.id === 'alerts'
          ? { ...tab, count: demoHeader.activeAlerts, tone: demoHeader.fault?.severity === 'fault' ? ('crit' as const) : ('warn' as const) }
          : tab,
      )
    : TABS;

  const renderDemo = (source: DemoSource) => {
    switch (activeTab) {
      case 'overview':
        return device ? (
          <BmsOverview data={source.buildDemoOverview(deviceKey, device.device_identifier, !DEMO_MODE)} device={device} />
        ) : null;
      case 'racks':
        return demoRacks && <RackOverview racks={demoRacks.racks} deviceLabel={deviceLabel} onModuleSelect={openModule} />;
      case 'modules':
        return demoRacks && (
          <ModuleOverview
            racks={demoRacks.racks}
            cellsPerModule={demoRacks.cellsPerModule}
            deviceLabel={deviceLabel}
            onModuleSelect={openModule}
          />
        );
      case 'cells':
        return demoRacks && (
          <CellOverview
            key={selectedModuleId ?? 'first'}
            racks={demoRacks.racks}
            cellsPerModule={demoRacks.cellsPerModule}
            getModuleDetail={demoRacks.getModuleDetail}
            moduleId={selectedModuleId}
            deviceLabel={deviceLabel}
          />
        );
      case 'history':
        return (
          <BmsHistory
            data={source.buildDemoHistory(deviceKey, historyRange)}
            deviceLabel={deviceLabel}
            range={historyRange}
            onRangeChange={setHistoryRange}
          />
        );
      case 'alerts':
        return <BmsAlerts alerts={source.buildDemoAlerts(deviceKey)} deviceLabel={deviceLabel} />;
    }
  };

  const renderLive = () => {
    if (activeTab === 'overview' && LIVE_SECTIONS.overview) {
      return device ? (
        <BmsOverview data={liveOverview} device={device} />
      ) : (
        <p className="text-[13px] text-ink-3">Loading device…</p>
      );
    }
    if (activeTab === 'history' && LIVE_SECTIONS.history) {
      return <BmsHistory data={liveHistory} deviceLabel={deviceLabel} />;
    }
    const key = activeTab as keyof typeof UNAVAILABLE_COPY;
    const copy = UNAVAILABLE_COPY[key];
    return (
      <DataUnavailable
        title={copy.title}
        icon={copy.icon}
        message={copy.message}
        requirement={BACKEND_REQUIREMENTS[key]}
        onPreview={() => setPreview(true)}
      />
    );
  };

  const hasLiveView = LIVE_SECTIONS[activeTab];

  return (
    <DashboardLayout>
      <div>
        {/* ------------------------------------------------ Device context */}
        <header className="mb-5">
          <BackButton onClick={() => navigate(-1)} />

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[28px] leading-tight font-semibold text-ink tracking-[-0.025em]">
                  {device?.name ?? 'Loading device…'}
                </h1>
                {device && <StatusBadge lastSeenAt={lastSeen} status={device.status} />}
                {demoHeader && <OperatingStateBadge state={demoHeader.state} />}
                {isTestData && (
                  <Badge tone="warn" size="xs">
                    Synthetic CAN test data
                  </Badge>
                )}
              </div>

              {/* Location is given its own line at body scale rather than being
                  one entry in a metadata rail — an operator needs to know which
                  site they are looking at before anything else. It is also the
                  entry point to the geofencing map, which stays empty until the
                  device has coordinates. */}
              {device && (
                <div className="mt-2.5">
                  <DeviceLocation
                    location={device.location}
                    deviceName={device.name}
                    deviceIdentifier={device.device_identifier}
                    siting={demoHeader?.siting ?? null}
                    variant="header"
                  />
                </div>
              )}

              {demoHeader ? (
                <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3.5">
                  <MetaItem icon={IconDevice} label="Identifier" value={device?.device_identifier ?? '—'} />
                  <MetaItem icon={IconPack} label="Type" value={device?.device_type ?? '—'} />
                  <MetaItem icon={IconRack} label="Configuration" value={demoHeader.configuration} />
                </dl>
              ) : (
                <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3.5">
                  <MetaItem icon={IconDevice} label="IMEI" value={device?.imei ?? device?.device_identifier ?? '—'} />
                  <MetaItem icon={IconCustomers} label="Customer" value={device?.customer_name ?? '—'} />
                  <MetaItem icon={IconPack} label="Type" value={device?.device_type ?? '—'} />
                  <MetaItem icon={IconClock} label="Last message" value={relativeTime(lastSeen)} />
                </dl>
              )}
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
              <SummaryCell label="State of charge" value={fixed(demoHeader ? demoHeader.soc : live?.soc)} unit="%" />
              <SummaryCell label="State of health" value={fixed(demoHeader ? demoHeader.soh : live?.soh)} unit="%" />
              <SummaryCell label="Battery voltage" value={fixed(demoHeader ? demoHeader.voltage : live?.voltage)} unit="V" />
              <div className="bg-surface px-4 py-3 flex flex-col justify-center gap-1.5 min-w-[110px]">
                <span className="label-technical">Telemetry</span>
                <span className="flex items-center gap-2">
                  <LiveDot tone={streaming ? 'ok' : 'idle'} size={6} live={streaming} />
                  <span className="text-[12.5px] font-medium text-ink">
                    {streaming ? 'Streaming' : live ? 'Not reporting' : 'Waiting for first message'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ------------------------------------------------ Active fault */}
        {demoHeader && <FaultBanner fault={demoHeader.fault} className="mb-5" />}

        {/* ------------------------------------------------ Workspace tabs */}
        <Tabs tabs={tabs} active={activeTab} onChange={(tab) => changeTab(tab as SectionId)} className="mb-6" />

        {/* ------------------------------------------------ Selected view */}
        <div key={`${activeTab}:${previewing ? 'demo' : 'live'}`} className="animate-fade-in">
          {DEMO_MODE && previewing ? (
            renderDemo(demo)
          ) : previewing ? (
            <>
              <DemoDataNotice deviceName={deviceLabel} onExit={() => setPreview(false)} />
              <DemoFrame>{renderDemo(demo)}</DemoFrame>
            </>
          ) : preview || DEMO_MODE ? (
            <Panel className="py-10 text-center">
              <p className="text-[13px] text-ink-3">{DEMO_MODE ? 'Loading…' : 'Loading layout preview…'}</p>
            </Panel>
          ) : (
            <>
              {hasLiveView && (
                <div className="flex justify-end -mt-2 mb-4">
                  <Button size="sm" variant="ghost" icon={IconEye} onClick={() => setPreview(true)}>
                    Preview full layout with demo data
                  </Button>
                </div>
              )}
              {renderLive()}
            </>
          )}
        </div>
      </div>
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

function SummaryCell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-surface px-4 py-3 flex flex-col justify-center gap-1.5 min-w-[104px]">
      <span className="label-technical">{label}</span>
      <span className="flex items-baseline gap-0.5">
        <span className="data-technical text-[19px] font-medium text-ink leading-none">{value}</span>
        {value !== '—' && <span className="text-[11px] text-ink-4">{unit}</span>}
      </span>
    </div>
  );
}
