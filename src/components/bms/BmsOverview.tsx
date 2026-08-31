import { useMemo } from 'react';
import StatusCard from '../StatusCard';
import GaugeCard from '../GaugeCard';
import TemperatureCard from '../TemperatureCard';
import ProtectionCard from '../ProtectionCard';
import ChartCard from '../ChartCard';
import AlertCard, { AlertItem } from '../AlertCard';
import { Panel, PanelHeader } from '../ui/Panel';
import { Readout } from '../ui/Metric';
import Sparkline from '../ui/Sparkline';
import { Badge } from '../ui/Badge';
import { OperatingStatePanel } from './OperatingState';
import SystemInformation from './SystemInformation';
import { buildDailyEnergy, buildSeries, getSystemTelemetry } from '../../data/bmsTelemetry';
import { OPERATING_STATE, operatingStateLabel } from '../../types/bms.types';
import { chartColors } from '../ui/chartTheme';
import { Device } from '../../types/database.types';
import {
  IconVoltage,
  IconCurrent,
  IconPower,
  IconHealth,
  IconTrend,
  IconCharge,
  IconEnergy,
  IconTemperature,
} from '../icons';

/* =============================================================================
   BmsOverview — system level

   Reading order matches the operator's questions: is it healthy and what is it
   doing → what are the battery's live figures → how is charge and health
   trending → what is protecting it → what changed recently.

   Everything here is system-scope. Rack, module and cell detail lives one level
   down in Rack Overview, which keeps the hierarchy legible:
   device → rack → module → cell.
   ========================================================================== */

const alertsData: AlertItem[] = [
  {
    type: 'warning',
    message: 'Module Over Temperature',
    time: '2 minutes ago',
    source: 'Rack 1 · Module 03',
    code: 'OT-1140',
    detail:
      'A module probe exceeded its warning threshold. Airflow at the rack inlet should be checked before the next charge cycle.',
  },
  {
    type: 'fault',
    message: 'Module Communication Loss',
    time: '15 minutes ago',
    source: 'Rack 3 · Module 11',
    code: 'LINK-4004',
    detail:
      'No CAN frames received from the module within the timeout window. The gateway is reachable, so the fault is most likely on the rack CAN segment.',
  },
  {
    type: 'info',
    message: 'Realtime connection established',
    time: 'Just now',
    source: 'Gateway · CAN-A',
    code: 'LINK-0001',
    detail: 'Telemetry stream resumed at a 1 s sample interval. No frames dropped since resync.',
  },
];

interface BmsOverviewProps {
  deviceId?: string;
  /** Identity record, used by the System information panel. */
  device?: Device;
}

export function BmsOverview({ deviceId, device }: BmsOverviewProps) {
  const key = deviceId || 'default';
  const telemetry = useMemo(() => getSystemTelemetry(key), [key]);

  /* Trend windows. Seeded per device so a chart is stable across tab switches. */
  const socSeries = useMemo(
    () =>
      buildSeries(`${key}:soc`, {
        points: 24,
        stepMinutes: 60,
        base: telemetry.soc,
        amplitude: 7,
        phase: -Math.PI / 2,
        decimals: 1,
        clamp: [0, 100],
      }),
    [key, telemetry.soc],
  );

  const maxTempSeries = useMemo(
    () =>
      buildSeries(`${key}:max-cell-temp`, {
        points: 24,
        stepMinutes: 60,
        base: telemetry.maxCellTemperature - 3,
        amplitude: 4.5,
        decimals: 1,
      }),
    [key, telemetry.maxCellTemperature],
  );

  const dailyEnergy = useMemo(() => buildDailyEnergy(key, 14), [key]);

  /* Short trailing windows shown beside the live values. */
  const microTrends = useMemo(
    () => ({
      voltage: buildSeries(`${key}:v-micro`, {
        points: 8,
        stepMinutes: 5,
        base: telemetry.batteryVoltage,
        amplitude: 1.6,
        decimals: 1,
      }).map((p) => p.value),
      current: buildSeries(`${key}:i-micro`, {
        points: 8,
        stepMinutes: 5,
        base: Math.abs(telemetry.batteryCurrent),
        amplitude: 6,
        decimals: 1,
      }).map((p) => p.value),
      power: buildSeries(`${key}:p-micro`, {
        points: 8,
        stepMinutes: 5,
        base: Math.abs(telemetry.batteryPower),
        amplitude: 4,
        decimals: 2,
      }).map((p) => p.value),
      soc: socSeries.slice(-8).map((p) => p.value),
    }),
    [key, telemetry, socSeries],
  );

  const isCharging = telemetry.state === OPERATING_STATE.CHARGE;
  const netEnergy = telemetry.dailyChargedKwh - telemetry.dailyDischargedKwh;
  const roundTrip =
    telemetry.dailyChargedKwh > 0
      ? (telemetry.dailyDischargedKwh / telemetry.dailyChargedKwh) * 100
      : 0;

  const health = telemetry.fault
    ? telemetry.fault.severity === 'fault'
      ? 'Fault'
      : 'Warning'
    : 'Normal';

  return (
    <div className="space-y-5">
      {/* ---------------------------------------------- Status & battery telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <StatusCard
          status={health}
          detail={
            telemetry.fault
              ? `${telemetry.fault.name} on ${telemetry.fault.source}.`
              : 'All racks reporting within configured limits.'
          }
          facts={[
            { label: 'Uptime', value: '42d 06h' },
            { label: 'Last frame', value: '0.4s ago' },
            { label: 'Firmware', value: 'v2.14.3' },
            { label: 'Cycles', value: telemetry.cycleCount },
          ]}
          className="lg:col-span-4"
        >
          {/* Operating state gets its own weight — it is the first thing asked */}
          <div className="pt-4 border-t border-black/[0.06]">
            <OperatingStatePanel
              state={telemetry.state}
              current={telemetry.batteryCurrent}
              power={telemetry.batteryPower}
            />
          </div>
        </StatusCard>

        <Panel className="lg:col-span-8">
          <PanelHeader
            title="Battery telemetry"
            icon={IconTrend}
            meta="1s interval"
            actions={
              <Badge tone="ok" size="xs" dot live>
                Streaming
              </Badge>
            }
            divided
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            <LiveMetric
              label="Battery voltage"
              value={telemetry.batteryVoltage.toFixed(1)}
              unit="V"
              icon={IconVoltage}
              trend={microTrends.voltage}
            />
            <LiveMetric
              label="Battery current"
              value={Math.abs(telemetry.batteryCurrent).toFixed(1)}
              unit="A"
              icon={IconCurrent}
              trend={microTrends.current}
              tone={isCharging ? 'info' : 'default'}
              hint={operatingStateLabel(telemetry.state)}
            />
            <LiveMetric
              label="Battery power"
              value={Math.abs(telemetry.batteryPower).toFixed(2)}
              unit="kW"
              icon={IconPower}
              trend={microTrends.power}
            />
            <LiveMetric
              label="Battery energy"
              value={telemetry.batteryEnergyKwh.toFixed(1)}
              unit="kWh"
              icon={IconEnergy}
              hint={`of ${telemetry.ratedEnergyKwh.toLocaleString()} kWh rated`}
            />
            <LiveMetric
              label="State of charge"
              value={telemetry.soc.toFixed(1)}
              unit="%"
              icon={IconCharge}
              trend={microTrends.soc}
            />
            <LiveMetric
              label="State of health"
              value={telemetry.soh.toFixed(1)}
              unit="%"
              icon={IconHealth}
              hint={`${telemetry.cycleCount} cycles`}
            />
          </div>
        </Panel>
      </div>

      {/* ---------------------------------------------- Charge, health, thermal, energy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GaugeCard
          title="State of charge"
          percentage={telemetry.soc}
          tone="brand"
          threshold={20}
          icon={IconCharge}
          caption={
            <span>
              <span className="data-technical text-ink-2">
                {telemetry.batteryEnergyKwh.toFixed(0)} kWh
              </span>{' '}
              stored · reserve at 20%
            </span>
          }
        />

        <GaugeCard
          title="State of health"
          percentage={telemetry.soh}
          tone="ok"
          icon={IconHealth}
          caption={
            <span>
              <span className="data-technical text-ink-2">{telemetry.cycleCount}</span> cycles ·{' '}
              {(100 - telemetry.soh).toFixed(1)}% capacity fade
            </span>
          }
        />

        <TemperatureCard
          max={telemetry.maxCellTemperature}
          min={telemetry.minCellTemperature}
          avg={Number(
            ((telemetry.maxCellTemperature + telemetry.minCellTemperature) / 2).toFixed(1),
          )}
          hottestSource={hottestSource(telemetry)}
          range={[10, 60]}
        />

        <DailyEnergyPanel
          charged={telemetry.dailyChargedKwh}
          discharged={telemetry.dailyDischargedKwh}
          net={netEnergy}
          roundTrip={roundTrip}
        />
      </div>

      {/* ---------------------------------------------- SOC over time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <ProtectionCard
          state={telemetry.racks.some((r) => r.contactorClosed) ? 'Connected' : 'Disconnected'}
          insulation={842}
          className="lg:col-span-4"
        />

        <ChartCard
          title="State of charge"
          type="line"
          data={socSeries.map((p) => p.value)}
          labels={socSeries.map((p) => p.label)}
          unit="SOC (%)"
          xLabel="Time"
          color={chartColors.ok}
          reference={{ value: 20, label: 'Reserve' }}
          caption="System state of charge across the last 24 hours."
          icon={IconCharge}
          height={210}
          className="lg:col-span-8"
        />
      </div>

      {/* ---------------------------------------------- Energy & thermal trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <ChartCard
          title="Daily charged & discharged energy"
          type="bar"
          series={[
            {
              key: 'charged',
              name: 'Charged',
              color: chartColors.info,
              data: dailyEnergy.map((d) => d.chargedKwh),
            },
            {
              key: 'discharged',
              name: 'Discharged',
              color: chartColors.ok,
              data: dailyEnergy.map((d) => d.dischargedKwh),
            },
          ]}
          labels={dailyEnergy.map((d) => d.label)}
          unit="Energy (kWh)"
          xLabel="Date"
          caption="Energy into and out of the battery per day over the last fortnight. The gap between the pair is round-trip loss."
          icon={IconEnergy}
          height={210}
          className="lg:col-span-7"
        />

        <ChartCard
          title="Max cell temperature trend"
          type="line"
          data={maxTempSeries.map((p) => p.value)}
          labels={maxTempSeries.map((p) => p.label)}
          unit="Temperature (°C)"
          xLabel="Time"
          color={chartColors.warn}
          reference={{ value: 45, label: 'Limit' }}
          caption="Hottest cell anywhere in the system, against the configured thermal limit."
          icon={IconTemperature}
          height={210}
          className="lg:col-span-5"
        />
      </div>

      {/* ---------------------------------------------- Events */}
      <AlertCard alerts={alertsData} />

      {/* ---------------------------------------------- Installation reference */}
      {device && <SystemInformation device={device} telemetry={telemetry} />}
    </div>
  );
}

/** Names the rack and module holding the hottest cell in the system. */
function hottestSource(telemetry: ReturnType<typeof getSystemTelemetry>) {
  let best = telemetry.racks[0];
  telemetry.racks.forEach((rack) => {
    if (rack.extremes.maxTemperature.value > best.extremes.maxTemperature.value) best = rack;
  });
  const reading = best.extremes.maxTemperature;
  return `${best.name} · Module ${String(reading.module).padStart(2, '0')}`;
}

/* -----------------------------------------------------------------------------
   LiveMetric — a value with its recent trajectory.
   -------------------------------------------------------------------------- */

function LiveMetric({
  label,
  value,
  unit,
  icon,
  trend,
  tone = 'default',
  hint,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  trend?: number[];
  tone?: 'default' | 'ok' | 'warn' | 'crit' | 'info';
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <Readout label={label} value={value} unit={unit} icon={icon} tone={tone} hint={hint} />
      {trend && (
        <Sparkline
          data={trend}
          tone={tone === 'default' ? 'neutral' : (tone as any)}
          width={104}
          height={22}
          area
          showLast
          className="mt-2.5"
        />
      )}
    </div>
  );
}

/* -----------------------------------------------------------------------------
   DailyEnergyPanel

   Today's throughput. Net and round-trip efficiency are shown alongside the two
   raw counters because they are what an operator judges the day by — a pair of
   bare totals invites mental arithmetic.
   -------------------------------------------------------------------------- */

function DailyEnergyPanel({
  charged,
  discharged,
  net,
  roundTrip,
}: {
  charged: number;
  discharged: number;
  net: number;
  roundTrip: number;
}) {
  const total = charged + discharged || 1;

  return (
    <Panel className="flex flex-col">
      <PanelHeader
        title="Energy today"
        icon={IconEnergy}
        actions={
          <Badge tone={net >= 0 ? 'info' : 'ok'} size="xs">
            {net >= 0 ? '+' : ''}
            {net.toFixed(1)} kWh
          </Badge>
        }
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <Readout label="Charged" value={charged.toFixed(1)} unit="kWh" tone="info" />
        <Readout
          label="Discharged"
          value={discharged.toFixed(1)}
          unit="kWh"
          tone="ok"
          align="right"
        />
      </div>

      {/* Proportional split of the day's throughput */}
      <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-3 mb-2.5">
        <span
          className="bg-info"
          style={{
            width: `${(charged / total) * 100}%`,
            transition: 'width 620ms var(--ease-precise)',
          }}
        />
        <span
          className="bg-ok"
          style={{
            width: `${(discharged / total) * 100}%`,
            transition: 'width 620ms var(--ease-precise)',
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-line">
        <span className="label-technical">Round trip</span>
        <span className="data-technical text-[13px] font-medium text-ink">
          {roundTrip.toFixed(1)}
          <span className="text-[11px] text-ink-4 ml-0.5">%</span>
        </span>
      </div>
    </Panel>
  );
}
