import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import AlertCard from '../../components/AlertCard';
import { Panel, PanelHeader } from '../../components/ui/Panel';
import { Readout } from '../../components/ui/Metric';
import { Badge, LiveDot } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { axisProps, gridProps, ChartTooltip, Y_AXIS_WIDTH, CHART_MARGIN } from '../../components/ui/chartTheme';
import { relativeTime } from '../../components/tableCells';
import { Overview } from '../../types/database.types';
import { useOverview } from '../../hooks/useOverview';
import {
  IconRack,
  IconVendors,
  IconCustomers,
  IconChevronRight,
  IconHealth,
  IconClock,
} from '../../components/icons';

const ACTIVITY_VERB: Record<Overview['activity'][number]['kind'], string> = {
  vendor: 'Vendor onboarded',
  customer: 'Customer onboarded',
  device: 'Device registered',
};

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
  const { overview, error, devices, online, offline, reportingPct: availabilityPct, lastIngest, ingestFresh, alerts } =
    useOverview();

  const counts = overview?.counts;
  const stats = {
    totalVendors: counts?.vendors ?? 0,
    totalCustomers: counts?.customers ?? 0,
    totalDevices: devices,
    onlineDevices: online,
    offlineDevices: offline,
  };

  const warningDevices = counts?.attention ?? 0;
  const healthyDevices = stats.onlineDevices - warningDevices;
  // Bar segments are shares of the fleet; an empty fleet draws an empty bar.
  const share = (n: number) => (stats.totalDevices ? (n / stats.totalDevices) * 100 : 0);

  // Days before any device was registered have no availability to plot.
  const availability = (overview?.availability ?? []).map((d) => ({
    label: new Date(d.day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    value: d.registered ? Math.round((d.reported / d.registered) * 1000) / 10 : null,
  }));


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

      {error && <p role="alert" className="mb-4 text-[13px] text-crit-ink">{error}</p>}

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
            <span className="bg-ok" style={{ width: `${share(healthyDevices)}%` }} />
            <span className="bg-warn" style={{ width: `${share(warningDevices)}%` }} />
            <span className="bg-crit" style={{ width: `${share(stats.offlineDevices)}%` }} />
          </div>
          <div className="flex items-center gap-4 mb-5">
            <LegendItem tone="bg-ok" label="Nominal" value={healthyDevices} />
            <LegendItem tone="bg-warn" label="Warning" value={warningDevices} />
            <LegendItem tone="bg-crit" label="Offline" value={stats.offlineDevices} />
          </div>

          <div className="h-[168px] -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={availability} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="availability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-ok)" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="var(--color-chart-ok)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} minTickGap={30} />
                <YAxis {...axisProps} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} width={Y_AXIS_WIDTH} />
                <Tooltip
                  content={<ChartTooltip unit="%" />}
                  cursor={{ stroke: 'var(--color-line-2)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Availability"
                  stroke="var(--color-chart-ok)"
                  strokeWidth={1.75}
                  fill="url(#availability)"
                  // A dot per day keeps a lone day of data visible; a line needs two.
                  dot={{ r: 2.5, fill: 'var(--color-chart-ok)', strokeWidth: 0 }}
                  activeDot={{ r: 3.5, fill: 'var(--color-chart-ok)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
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
              hint={
                stats.totalCustomers
                  ? `≈${Math.round(stats.totalDevices / stats.totalCustomers)} per customer`
                  : 'Registered by customers'
              }
              onClick={() => navigate('/admin/devices')}
            />
          </ul>

          <div className="mt-auto px-5 py-4 border-t border-line bg-surface-2">
            <div className="flex items-center gap-2">
              <LiveDot tone={ingestFresh ? 'ok' : 'idle'} size={6} live={ingestFresh} />
              <span className="text-[12px] text-ink-3">
                {ingestFresh ? 'Ingest healthy' : 'No recent messages'} · last write{' '}
                <span className="data-technical text-ink-2">{relativeTime(lastIngest)}</span>
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
            {(overview?.activity ?? []).map((activity, index) => (
              <li key={index} className="px-5 py-3.5 hover:bg-surface-2 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13px] text-ink leading-snug">
                      {ACTIVITY_VERB[activity.kind]}: {activity.name}
                      {activity.kind === 'device' && (
                        <span className="text-ink-3"> · {activity.imei} for {activity.customer_name}</span>
                      )}
                    </p>
                    <p className="text-[11.5px] text-ink-4 mt-1">by {activity.actor ?? 'System'}</p>
                  </div>
                  <span className="data-technical text-[11px] text-ink-4 shrink-0 pt-0.5">
                    {relativeTime(activity.at)}
                  </span>
                </div>
              </li>
            ))}
            {overview && overview.activity.length === 0 && (
              <li className="px-5 py-6 text-[13px] text-ink-3">
                Nothing yet. Onboarded vendors, customers and devices appear here.
              </li>
            )}
          </ul>
        </Panel>

        <AlertCard alerts={alerts} title="System alerts" className="lg:col-span-5" />
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
