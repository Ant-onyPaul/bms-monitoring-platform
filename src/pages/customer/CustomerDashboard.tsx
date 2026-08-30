import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/ui/Panel';
import { Readout, Meter } from '../../components/ui/Metric';
import { Badge, LiveDot } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import AlertCard, { AlertItem } from '../../components/AlertCard';
import Gauge from '../../components/ui/Gauge';
import { IconRack, IconHealth, IconCharge, IconTemperature } from '../../components/icons';

const SITE_EVENTS: AlertItem[] = [
  {
    type: 'info',
    message: 'Overnight charge window completed',
    time: '6 hours ago',
    source: 'Main HQ Battery',
    code: 'CHG-0042',
    detail: 'Pack reached 92% before the window closed. No cell exceeded its balancing threshold.',
  },
  {
    type: 'warning',
    message: 'Backup unit has not reported',
    time: '1 hour ago',
    source: 'Branch 1 Backup',
    code: 'LINK-4004',
    detail:
      'The unit last reported an hour ago. If it does not resume within the day, contact your vendor.',
  },
];

/* =============================================================================
   CustomerDashboard

   A customer wants reassurance, not diagnostics: is my storage available, how
   much energy is in it, and is anything wrong. Cell-level detail stays one
   click away inside the device workspace rather than on this page.
   ========================================================================== */

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Mock data for Customer Dashboard
  const stats = {
    totalDevices: 12,
    onlineDevices: 11,
    offlineDevices: 1,
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Your storage"
        title="Overview"
        description={`Signed in as ${profile?.full_name || 'Customer'}. Availability and condition across your installed systems.`}
        actions={
          <Button variant="secondary" icon={IconRack} onClick={() => navigate('/customer/devices')}>
            My devices
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Stored energy */}
        <Panel className="lg:col-span-4 flex flex-col">
          <PanelHeader
            title="Stored energy"
            icon={IconCharge}
            actions={
              <Badge tone="ok" size="xs" dot live>
                Charging
              </Badge>
            }
          />
          <div className="flex-1 flex items-center justify-center py-2">
            <Gauge
              value={82}
              label="of capacity"
              tone="brand"
              threshold={20}
              size={140}
              caption={
                <span>
                  <span className="data-technical text-ink-2">7.4 kWh</span> available of 9.0 kWh
                </span>
              }
            />
          </div>
        </Panel>

        {/* Availability */}
        <Panel className="lg:col-span-8">
          <PanelHeader title="System availability" icon={IconHealth} divided />

          <div className="grid grid-cols-3 gap-x-6 gap-y-5 mb-5">
            <Readout label="Systems" value={stats.totalDevices} icon={IconRack} size="lg" />
            <Readout label="Online" value={stats.onlineDevices} tone="ok" size="lg" />
            <Readout
              label="Offline"
              value={stats.offlineDevices}
              tone={stats.offlineDevices > 0 ? 'crit' : 'default'}
              size="lg"
            />
          </div>

          <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-3 mb-3">
            <span
              className="bg-ok"
              style={{
                width: `${(stats.onlineDevices / stats.totalDevices) * 100}%`,
                transition: 'width 620ms var(--ease-precise)',
              }}
            />
            <span className="bg-crit flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 mt-5 border-t border-line">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <IconTemperature size={12} className="text-ink-4" />
                  <span className="label-technical">Warmest system</span>
                </span>
                <span className="data-technical text-[13px] text-ink">
                  34.2<span className="text-[11px] text-ink-4 ml-0.5">°C</span>
                </span>
              </div>
              <Meter value={34.2} min={10} max={60} nominal={[10, 35]} tone="ok" height={4} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <IconHealth size={12} className="text-ink-4" />
                  <span className="label-technical">Fleet health</span>
                </span>
                <span className="data-technical text-[13px] text-ink">
                  97<span className="text-[11px] text-ink-4 ml-0.5">%</span>
                </span>
              </div>
              <Meter value={97} min={0} max={100} tone="ok" height={4} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-line">
            <LiveDot tone="ok" size={6} live />
            <span className="text-[12px] text-ink-3">
              Telemetry received from {stats.onlineDevices} of {stats.totalDevices} systems in the
              last minute
            </span>
          </div>
        </Panel>
      </div>

      <AlertCard alerts={SITE_EVENTS} title="Recent events" />
    </DashboardLayout>
  );
}
