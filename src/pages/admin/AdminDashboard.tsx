import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import AlertCard, { AlertItem } from '../../components/AlertCard';
import { Panel, PanelHeader } from '../../components/ui/Panel';
import { Readout } from '../../components/ui/Metric';
import { Badge, LiveDot } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { axisProps, gridProps, ChartTooltip, Y_AXIS_WIDTH, CHART_MARGIN } from '../../components/ui/chartTheme';
import {
  IconRack,
  IconVendors,
  IconCustomers,
  IconChevronRight,
  IconHealth,
  IconClock,
} from '../../components/icons';

const MOCK_ALERTS: AlertItem[] = [
  {
    type: 'fault',
    message: 'Offline Device Detected: INV-02',
    time: '10 mins ago',
    source: 'Site Bravo · Rack 2',
    code: 'LINK-4004',
    detail:
      'No telemetry frames received for 11 minutes. The gateway is reachable, so the fault is most likely on the rack CAN segment.',
  },
  {
    type: 'warning',
    message: 'High temperature on Site Alpha',
    time: '1 hour ago',
    source: 'Site Alpha · Rack 1 · Module 03',
    code: 'OT-1140',
    detail:
      'Peak probe reached 44.2 °C, within 0.8 °C of the configured limit. Ambient at the site is running 6 °C above seasonal norm.',
  },
  {
    type: 'info',
    message: 'Firmware updated on 12 devices',
    time: '3 hours ago',
    source: 'Fleet · scheduled window',
    code: 'FW-2143',
    detail: 'Controller v2.14.3 rolled out to the Northeast group. No rollbacks reported.',
  },
];

const MOCK_ACTIVITY = [
  { user: 'Admin User', action: 'Approved vendor registration: Solartron', time: '1 hour ago' },
  { user: 'System', action: 'Automated backup completed', time: '5 hours ago' },
  { user: 'Tech Support', action: 'Resolved support ticket #1042', time: '1 day ago' },
  { user: 'Admin User', action: 'Created new device profile: BATT-X1', time: '2 days ago' },
];

/** Fourteen days of fleet availability, as a percentage of devices reporting. */
const AVAILABILITY = [
  99.4, 99.6, 99.5, 98.9, 99.2, 99.7, 99.8, 99.6, 99.1, 98.4, 99.0, 99.5, 99.7, 96.6,
].map((value, index) => ({
  label: new Date(Date.UTC(2026, 7, 16 + index)).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  }),
  value,
}));

/* =============================================================================
   AdminDashboard

   A fleet answers a different question from a device: not "what is this pack
   doing" but "where do I need to look today". So availability leads, the
   offline count is a link rather than a statistic, and the org counts are
   demoted to a secondary panel — they are inventory, not operations.
   ========================================================================== */

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Mock data for Admin Dashboard
  const stats = {
    totalVendors: 12,
    totalCustomers: 45,
    totalDevices: 1240,
    onlineDevices: 1198,
    offlineDevices: 42,
  };

  const availabilityPct = (stats.onlineDevices / stats.totalDevices) * 100;
  const warningDevices = 17;
  const healthyDevices = stats.onlineDevices - warningDevices;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Fleet operations"
        title="Overview"
        description={`Signed in as ${profile?.full_name || 'Admin'}. Fleet-wide availability, organisation inventory and the events that need attention.`}
        actions={
          <Button variant="secondary" icon={IconRack} onClick={() => navigate('/admin/devices')}>
            All devices
          </Button>
        }
      />

      {/* ------------------------------------------------ Fleet availability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        <Panel className="lg:col-span-8">
          <PanelHeader
            title="Fleet availability"
            icon={IconHealth}
            meta="last 14 days"
            actions={
              <Badge tone={availabilityPct >= 99 ? 'ok' : 'warn'} size="xs" dot live>
                {availabilityPct.toFixed(1)}% reporting
              </Badge>
            }
            divided
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 mb-5">
            <Readout label="Devices" value={stats.totalDevices.toLocaleString()} icon={IconRack} />
            <Readout label="Online" value={stats.onlineDevices.toLocaleString()} tone="ok" />
            <Readout label="Needs attention" value={warningDevices} tone="warn" />
            <Readout label="Offline" value={stats.offlineDevices} tone="crit" />
          </div>

          {/* Population bar — proportional, so the mix reads as a shape */}
          <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-3 mb-2">
            <span
              className="bg-ok"
              style={{ width: `${(healthyDevices / stats.totalDevices) * 100}%` }}
            />
            <span
              className="bg-warn"
              style={{ width: `${(warningDevices / stats.totalDevices) * 100}%` }}
            />
            <span
              className="bg-crit"
              style={{ width: `${(stats.offlineDevices / stats.totalDevices) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mb-5">
            <LegendItem tone="bg-ok" label="Nominal" value={healthyDevices} />
            <LegendItem tone="bg-warn" label="Warning" value={warningDevices} />
            <LegendItem tone="bg-crit" label="Offline" value={stats.offlineDevices} />
          </div>

          <div className="h-[168px] -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={AVAILABILITY} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="availability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} minTickGap={30} />
                <YAxis {...axisProps} domain={[96, 100]} width={Y_AXIS_WIDTH} tickCount={5} />
                <Tooltip
                  content={<ChartTooltip unit="%" />}
                  cursor={{ stroke: 'var(--color-line-2)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Availability"
                  stroke="#10B981"
                  strokeWidth={1.75}
                  fill="url(#availability)"
                  dot={false}
                  activeDot={{ r: 3.5, fill: '#10B981', stroke: 'var(--color-surface)', strokeWidth: 2 }}
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Organisation inventory */}
        <Panel flush className="lg:col-span-4 overflow-hidden flex flex-col">
          <div className="px-5 pt-4">
            <PanelHeader title="Organisation" icon={IconVendors} divided />
          </div>

          <ul className="divide-y divide-line">
            <InventoryRow
              icon={IconVendors}
              label="Vendors"
              value={stats.totalVendors}
              hint="Active partners"
              onClick={() => navigate('/admin/vendors')}
            />
            <InventoryRow
              icon={IconCustomers}
              label="Customers"
              value={stats.totalCustomers}
              hint="Across all vendors"
              onClick={() => navigate('/admin/customers')}
            />
            <InventoryRow
              icon={IconRack}
              label="Devices"
              value={stats.totalDevices.toLocaleString()}
              hint={`≈${Math.round(stats.totalDevices / stats.totalCustomers)} per customer`}
              onClick={() => navigate('/admin/devices')}
            />
          </ul>

          <div className="mt-auto px-5 py-4 border-t border-line bg-surface-2">
            <div className="flex items-center gap-2">
              <LiveDot tone="ok" size={6} live />
              <span className="text-[12px] text-ink-3">
                Ingest healthy · last write{' '}
                <span className="data-technical text-ink-2">0.4s ago</span>
              </span>
            </div>
          </div>
        </Panel>
      </div>

      {/* ------------------------------------------------ Activity & alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Panel flush className="lg:col-span-7 overflow-hidden flex flex-col">
          <div className="px-5 pt-4">
            <PanelHeader title="Recent activity" icon={IconClock} divided />
          </div>

          <ul className="divide-y divide-line">
            {MOCK_ACTIVITY.map((activity, index) => (
              <li key={index} className="px-5 py-3.5 hover:bg-surface-2 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13px] text-ink leading-snug">{activity.action}</p>
                    <p className="text-[11.5px] text-ink-4 mt-1">{activity.user}</p>
                  </div>
                  <span className="data-technical text-[11px] text-ink-4 shrink-0 pt-0.5">
                    {activity.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <AlertCard alerts={MOCK_ALERTS} title="System alerts" className="lg:col-span-5" />
      </div>
    </DashboardLayout>
  );
}

function LegendItem({ tone, label, value }: { tone: string; label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-[2px] ${tone}`} />
      <span className="text-[11.5px] text-ink-3">{label}</span>
      <span className="data-technical text-[11.5px] text-ink-2">{value.toLocaleString()}</span>
    </span>
  );
}

function InventoryRow({
  icon: Icon,
  label,
  value,
  hint,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: React.ReactNode;
  hint: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer
          transition-colors duration-150 hover:bg-surface-2
          focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      >
        <Icon
          size={15}
          className="shrink-0 text-ink-4 group-hover:text-brand-ink transition-colors"
        />
        <span className="min-w-0 flex-1">
          <span className="block label-technical mb-1">{label}</span>
          <span className="block data-technical text-[19px] font-medium text-ink leading-none">
            {value}
          </span>
          <span className="block text-[11.5px] text-ink-4 mt-1.5">{hint}</span>
        </span>
        <IconChevronRight
          size={14}
          className="shrink-0 text-ink-4 opacity-0 group-hover:opacity-100
            transition-[opacity,transform] duration-150 group-hover:translate-x-0.5"
        />
      </button>
    </li>
  );
}
