import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/ui/Panel';
import { Readout } from '../../components/ui/Metric';
import { Badge, LiveDot } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import AlertCard from '../../components/AlertCard';
import { relativeTime } from '../../components/tableCells';
import { useOverview } from '../../hooks/useOverview';
import { IconRack, IconCustomers, IconHealth, IconChevronRight } from '../../components/icons';

/* =============================================================================
   VendorDashboard

   Same shape as the admin overview, scoped to the vendor's own book of
   business. Availability leads; customer and device counts are inventory.
   ========================================================================== */

export default function VendorDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Scoped by the API to this vendor's customers and their devices.
  const { overview, error, devices, online, offline, reportingPct: availability, lastIngest, ingestFresh, alerts } =
    useOverview();

  const stats = {
    totalCustomers: overview?.counts.customers ?? 0,
    totalDevices: devices,
    onlineDevices: online,
    offlineDevices: offline,
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Vendor portal"
        title="Overview"
        description={`Signed in as ${profile?.full_name || 'Vendor'}. Availability and activity across the devices you manage.`}
        actions={
          <Button variant="secondary" icon={IconRack} onClick={() => navigate('/vendor/devices')}>
            All devices
          </Button>
        }
      />

      {error && <p role="alert" className="mb-4 text-[13px] text-crit-ink">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        <Panel className="lg:col-span-7">
          <PanelHeader
            title="Managed fleet"
            icon={IconHealth}
            actions={
              <Badge tone={availability >= 97 ? 'ok' : 'warn'} size="xs" dot live>
                {availability.toFixed(1)}% reporting
              </Badge>
            }
            divided
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 mb-5">
            <Readout label="Devices" value={stats.totalDevices} icon={IconRack} />
            <Readout label="Online" value={stats.onlineDevices} tone="ok" />
            <Readout label="Offline" value={stats.offlineDevices} tone="crit" />
          </div>

          <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-3 mb-3">
            <span
              className="bg-ok"
              style={{
                width: `${availability}%`,
                transition: 'width 620ms var(--ease-precise)',
              }}
            />
            <span className="bg-crit flex-1" />
          </div>
          <p className="text-[12px] text-ink-3">
            {stats.offlineDevices} of {stats.totalDevices} units have not reported in the last five
            minutes.
          </p>
        </Panel>

        <Panel flush className="lg:col-span-5 overflow-hidden flex flex-col">
          <div className="px-5 pt-4">
            <PanelHeader title="Your customers" icon={IconCustomers} divided />
          </div>

          <button
            type="button"
            onClick={() => navigate('/vendor/customers')}
            className="group flex items-center gap-3 px-5 py-4 text-left cursor-pointer
              hover:bg-surface-2 transition-colors border-b border-line
              focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
          >
            <span className="flex-1">
              <Readout
                label="Customers"
                value={stats.totalCustomers}
                hint={
                  stats.totalCustomers
                    ? `≈${Math.round(stats.totalDevices / stats.totalCustomers)} devices each`
                    : 'Add a customer to get started'
                }
                size="lg"
              />
            </span>
            <IconChevronRight
              size={15}
              className="text-ink-4 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>

          <div className="mt-auto px-5 py-4 bg-surface-2">
            <div className="flex items-center gap-2">
              <LiveDot tone={ingestFresh ? 'ok' : 'idle'} size={6} live={ingestFresh} />
              <span className="text-[12px] text-ink-3">
                {ingestFresh ? 'Telemetry arriving' : 'No recent telemetry'} · last message{' '}
                <span className="data-technical text-ink-2">{relativeTime(lastIngest)}</span>
              </span>
            </div>
          </div>
        </Panel>
      </div>

      <AlertCard alerts={alerts} title="Device alerts" />
    </DashboardLayout>
  );
}
