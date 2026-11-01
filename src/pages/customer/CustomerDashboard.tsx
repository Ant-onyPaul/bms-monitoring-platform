import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/ui/Panel';
import { Readout, Meter } from '../../components/ui/Metric';
import { Badge, LiveDot } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import AlertCard from '../../components/AlertCard';
import Gauge from '../../components/ui/Gauge';
import { relativeTime } from '../../components/tableCells';
import { useOverview } from '../../hooks/useOverview';
import { IconRack, IconHealth, IconCharge, IconTemperature } from '../../components/icons';

/** Net pack current below this magnitude (A) reads as idle rather than charging/discharging. */
const IDLE_CURRENT_A = 0.5;

/* =============================================================================
   CustomerDashboard

   A customer wants reassurance, not diagnostics: is my storage available, how
   much energy is in it, and is anything wrong. Cell-level detail stays one
   click away inside the device workspace rather than on this page.
   ========================================================================== */

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Scoped by the API to this customer's own devices.
  const { overview, error, devices, online, offline, lastIngest, ingestFresh, alerts } = useOverview();
  const fleet = overview?.fleet;

  const stats = {
    totalDevices: devices,
    onlineDevices: online,
    offlineDevices: offline,
  };

  const current = fleet?.total_current ?? null;
  const flow =
    current === null
      ? { label: 'No data', tone: 'neutral' as const }
      : current > IDLE_CURRENT_A
        ? { label: 'Charging', tone: 'ok' as const }
        : current < -IDLE_CURRENT_A
          ? { label: 'Discharging', tone: 'info' as const }
          : { label: 'Idle', tone: 'neutral' as const };

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

      {error && <p role="alert" className="mb-4 text-[13px] text-crit-ink">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* State of charge */}
        <Panel className="lg:col-span-4 flex flex-col">
          <PanelHeader
            title="State of charge"
            icon={IconCharge}
            actions={
              <Badge tone={flow.tone} size="xs" dot live={flow.tone !== 'neutral'}>
                {flow.label}
              </Badge>
            }
          />
          <div className="flex-1 flex items-center justify-center py-2">
            {fleet?.avg_soc != null ? (
              <Gauge
                value={Math.round(fleet.avg_soc * 10) / 10}
                label="charged"
                tone="brand"
                threshold={20}
                size={140}
                caption={
                  <span>
                    Average of {stats.onlineDevices} reporting system{stats.onlineDevices === 1 ? '' : 's'}
                  </span>
                }
              />
            ) : (
              <p className="text-[13px] text-ink-3 text-center">No system is reporting right now.</p>
            )}
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
                width: `${stats.totalDevices ? (stats.onlineDevices / stats.totalDevices) * 100 : 0}%`,
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
                  {fleet?.max_temperature != null ? fleet.max_temperature.toFixed(1) : '—'}
                  <span className="text-[11px] text-ink-4 ml-0.5">°C</span>
                </span>
              </div>
              {fleet?.max_temperature != null && (
                <>
                  <Meter
                    value={fleet.max_temperature}
                    min={10}
                    max={60}
                    nominal={[10, 45]}
                    tone={fleet.max_temperature >= 45 ? 'warn' : 'ok'}
                    height={4}
                  />
                  <p className="mt-1.5 text-[11.5px] text-ink-4 truncate">{fleet.warmest_device}</p>
                </>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <IconHealth size={12} className="text-ink-4" />
                  <span className="label-technical">Average health (SoH)</span>
                </span>
                <span className="data-technical text-[13px] text-ink">
                  {fleet?.avg_soh != null ? fleet.avg_soh.toFixed(1) : '—'}
                  <span className="text-[11px] text-ink-4 ml-0.5">%</span>
                </span>
              </div>
              {fleet?.avg_soh != null && <Meter value={fleet.avg_soh} min={0} max={100} tone="ok" height={4} />}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-line">
            <LiveDot tone={ingestFresh ? 'ok' : 'idle'} size={6} live={ingestFresh} />
            <span className="text-[12px] text-ink-3">
              {stats.onlineDevices} of {stats.totalDevices} systems reported in the last five minutes · last
              message <span className="data-technical text-ink-2">{relativeTime(lastIngest)}</span>
            </span>
          </div>
        </Panel>
      </div>

      <AlertCard alerts={alerts} title="System alerts" />
    </DashboardLayout>
  );
}
