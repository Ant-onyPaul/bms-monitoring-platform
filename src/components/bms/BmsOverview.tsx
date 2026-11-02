import StatusCard from '../StatusCard';
import TemperatureCard from '../TemperatureCard';
import ProtectionCard from '../ProtectionCard';
import ChartCard from '../ChartCard';
import AlertCard from '../AlertCard';
import { Panel, PanelHeader } from '../ui/Panel';
import { Readout } from '../ui/Metric';
import Sparkline from '../ui/Sparkline';
import { Badge } from '../ui/Badge';
import { OperatingStatePanel } from './OperatingState';
import SystemInformation from './SystemInformation';
import { DataUnavailable } from './DataUnavailable';
import { OPERATING_STATE, operatingStateLabel } from '../../types/bms.types';
import { chartColors } from '../ui/chartTheme';
import { Device } from '../../types/database.types';
import type { OverviewData } from '../../services/deviceData/types';
import {
  IconVoltage,
  IconCurrent,
  IconPower,
  IconHealth,
  IconTrend,
  IconCharge,
  IconEnergy,
  IconTemperature,
  IconProtection,
  IconWarning,
} from '../icons';

/* =============================================================================
   BmsOverview — system level

   Reading order matches the operator's questions: is it healthy and what is it
   doing → what are the battery's live figures → how is charge and health
   trending → what is protecting it → what changed recently.

   Everything here is system-scope. Rack, module and cell detail lives one level
   down in Rack Overview, which keeps the hierarchy legible:
   device → rack → module → cell.

   Presentation only: every figure comes from `data`, filled by the live API or,
   in an explicit preview, by the demo source. A figure the source does not
   report renders as "—" or as a "Not reported" card in the same slot, so the
   layout keeps its shape without inventing a value.
   ========================================================================== */

/** Thresholds drawn on the original design. Shown only where the source defines them. */
const DEMO_RESERVE_PCT = 20;
const DEMO_THERMAL_LIMIT_C = 45;

interface BmsOverviewProps {
  data: OverviewData;
  /** Identity record, used by the System information panel. */
  device: Device;
}

const fixed = (value: number | null, digits: number) => (value === null ? '—' : value.toFixed(digits));
const abs = (value: number | null) => (value === null ? null : Math.abs(value));

export function BmsOverview({ data, device }: BmsOverviewProps) {
  const { readings, trends } = data;
  const isDemo = data.provenance === 'demo';
  const isCharging = data.state === OPERATING_STATE.CHARGE;

  const health =
    data.fault === undefined
      ? 'Unknown'
      : data.fault
        ? data.fault.severity === 'fault'
          ? 'Fault'
          : 'Warning'
        : 'Normal';

  const statusDetail =
    data.fault === undefined
      ? undefined
      : data.fault
        ? `${data.fault.name} on ${data.fault.source}.`
        : 'All racks reporting within configured limits.';

  const sampleCount = trends.soc.length;

  return (
    <div className="space-y-5">
      {/* ---------------------------------------------- Status & battery telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <StatusCard status={health} detail={statusDetail} facts={data.facts} className="lg:col-span-3">
          {/* Operating state gets its own weight — it is the first thing asked */}
          {data.state !== null && (
            <div className="pt-4 border-t border-black/[0.06]">
              <OperatingStatePanel
                state={data.state}
                current={readings.current ?? undefined}
                power={readings.powerKw ?? undefined}
              />
            </div>
          )}
        </StatusCard>

        {/* The dominant metric on the page. Everything else is context for it. */}
        <SocHero
          soc={readings.soc}
          storedKwh={readings.energyKwh}
          ratedKwh={readings.ratedKwh}
          reserve={isDemo ? DEMO_RESERVE_PCT : null}
          className="lg:col-span-4"
        />

        <Panel className="lg:col-span-5">
          <PanelHeader
            title="Battery telemetry"
            icon={IconTrend}
            meta={data.sampleInterval}
            actions={
              <Badge tone={data.streaming ? 'ok' : 'idle'} size="xs" dot live={data.streaming}>
                {data.streaming ? 'Streaming' : 'Not reporting'}
              </Badge>
            }
            divided
          />

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <LiveMetric
              label="Battery voltage"
              value={fixed(readings.voltage, 1)}
              unit="V"
              icon={IconVoltage}
              trend={trends.voltage}
              tone="ok"
            />
            <LiveMetric
              label="Battery current"
              value={fixed(abs(readings.current), 1)}
              unit="A"
              icon={IconCurrent}
              trend={trends.current}
              tone={isCharging ? 'info' : 'default'}
              hint={data.state !== null ? operatingStateLabel(data.state) : undefined}
            />
            <LiveMetric
              label="Battery power"
              value={fixed(abs(readings.powerKw), 2)}
              unit="kW"
              icon={IconPower}
              trend={trends.powerKw}
              tone="info"
            />
            {/* Stored energy when the source reports it; otherwise the pack
                temperature the device does send, so no live reading is hidden. */}
            {readings.energyKwh !== null || readings.packTemperature === null ? (
              <LiveMetric
                label="Battery energy"
                value={fixed(readings.energyKwh, 1)}
                unit="kWh"
                icon={IconEnergy}
                hint={readings.ratedKwh !== null ? `of ${readings.ratedKwh.toLocaleString()} kWh rated` : undefined}
              />
            ) : (
              <LiveMetric
                label="Pack temperature"
                value={fixed(readings.packTemperature, 1)}
                unit="°C"
                icon={IconTemperature}
                tone="warn"
              />
            )}
            <LiveMetric
              label="State of charge"
              value={fixed(readings.soc, 1)}
              unit="%"
              icon={IconCharge}
              trend={trends.soc.slice(-8).map((p) => p.value)}
              tone="ok"
            />
            <LiveMetric
              label="State of health"
              value={fixed(readings.soh, 1)}
              unit="%"
              icon={IconHealth}
              hint={readings.cycleCount !== null ? `${readings.cycleCount} cycles` : undefined}
            />
          </div>
        </Panel>
      </div>

      {/* ---------------------------------------------- Thermal · energy · protection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {data.cellTemperatures ? (
          <TemperatureCard
            max={data.cellTemperatures.max}
            min={data.cellTemperatures.min}
            avg={data.cellTemperatures.avg}
            hottestSource={data.cellTemperatures.hottestSource ?? undefined}
            range={[10, 60]}
            className="lg:col-span-4"
          />
        ) : (
          <DataUnavailable
            compact
            title="Cell temperatures"
            icon={IconTemperature}
            message="Only a single pack temperature is reported. Min/max cell temperatures need rack data."
            className="lg:col-span-4"
          />
        )}

        {data.energyToday ? (
          <DailyEnergyPanel
            charged={data.energyToday.charged}
            discharged={data.energyToday.discharged}
            className="lg:col-span-4"
          />
        ) : (
          <DataUnavailable
            compact
            title="Energy today"
            icon={IconEnergy}
            message="Daily charged and discharged energy is not reported yet."
            className="lg:col-span-4"
          />
        )}

        {data.protection ? (
          <ProtectionCard
            state={data.protection.contactorClosed ? 'Connected' : 'Disconnected'}
            insulation={data.protection.insulation ?? undefined}
            className="lg:col-span-4"
          />
        ) : (
          <DataUnavailable
            compact
            title="Protection"
            icon={IconProtection}
            message="Contactor and protection status are not reported yet."
            className="lg:col-span-4"
          />
        )}
      </div>

      {/* ---------------------------------------------- SOC over time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {trends.soc.length > 1 ? (
          <ChartCard
            title="State of charge"
            type="line"
            data={trends.soc.map((p) => p.value)}
            labels={trends.soc.map((p) => p.label)}
            unit="SOC (%)"
            xLabel="Time"
            color={chartColors.ok}
            reference={isDemo ? { value: DEMO_RESERVE_PCT, label: 'Reserve' } : undefined}
            caption={
              isDemo
                ? 'System state of charge across the last 24 hours.'
                : `State of charge from the last ${sampleCount} stored telemetry messages.`
            }
            icon={IconCharge}
            height={230}
            className="lg:col-span-7"
          />
        ) : (
          <DataUnavailable
            compact
            title="State of charge"
            icon={IconCharge}
            message="No stored state-of-charge readings yet."
            className="lg:col-span-7"
          />
        )}

        {trends.temperature.length > 1 ? (
          <ChartCard
            title={trends.temperatureKind === 'max-cell' ? 'Max cell temperature trend' : 'Pack temperature trend'}
            type="line"
            data={trends.temperature.map((p) => p.value)}
            labels={trends.temperature.map((p) => p.label)}
            unit="Temperature (°C)"
            xLabel="Time"
            color={chartColors.warn}
            reference={isDemo ? { value: DEMO_THERMAL_LIMIT_C, label: 'Limit' } : undefined}
            caption={
              trends.temperatureKind === 'max-cell'
                ? 'Hottest cell anywhere in the system, against the configured thermal limit.'
                : 'Pack temperature from stored telemetry messages.'
            }
            icon={IconTemperature}
            height={230}
            className="lg:col-span-5"
          />
        ) : (
          <DataUnavailable
            compact
            title="Temperature trend"
            icon={IconTemperature}
            message="No stored temperature readings yet."
            className="lg:col-span-5"
          />
        )}
      </div>

      {/* ---------------------------------------------- Daily energy */}
      {data.dailyEnergy ? (
        <ChartCard
          title="Daily charged & discharged energy"
          type="bar"
          series={[
            {
              key: 'charged',
              name: 'Charged',
              color: chartColors.info,
              data: data.dailyEnergy.map((d) => d.chargedKwh),
            },
            {
              key: 'discharged',
              name: 'Discharged',
              color: chartColors.ok,
              data: data.dailyEnergy.map((d) => d.dischargedKwh),
            },
          ]}
          labels={data.dailyEnergy.map((d) => d.label)}
          unit="Energy (kWh)"
          xLabel="Date"
          caption="Energy into and out of the battery per day over the last fortnight. The gap between the pair is round-trip loss."
          icon={IconEnergy}
          height={230}
        />
      ) : (
        <DataUnavailable
          compact
          title="Daily charged & discharged energy"
          icon={IconEnergy}
          message="Needs a daily energy endpoint, e.g. GET /api/devices/:id/energy/daily."
        />
      )}

      {/* ---------------------------------------------- Events */}
      {data.events ? (
        <AlertCard alerts={data.events} />
      ) : (
        <DataUnavailable
          compact
          title="Recent events"
          icon={IconWarning}
          message="Device events are not reported yet. See the Alerts tab for what is needed."
        />
      )}

      {/* ---------------------------------------------- Installation reference */}
      <SystemInformation device={device} info={data.system} />
    </div>
  );
}

/* -----------------------------------------------------------------------------
   SocHero

   State of charge is the one number an operator reads from across the room, so
   it is given the weight of a headline rather than a tile among tiles. The arc
   gauges it replaced said the same thing at a fifth of the legibility.

   The value carries its own context: stored energy against usable capacity, and
   a track showing where the charge sits relative to the reserve floor. Context
   the source does not report is left out rather than estimated.
   -------------------------------------------------------------------------- */

function SocHero({
  soc,
  storedKwh,
  ratedKwh,
  reserve,
  className = '',
}: {
  soc: number | null;
  storedKwh: number | null;
  ratedKwh: number | null;
  /** Reserve floor, %. Null when the source does not define one. */
  reserve: number | null;
  className?: string;
}) {
  const tone =
    soc === null || reserve === null
      ? 'ok'
      : soc < reserve
        ? 'crit'
        : soc < reserve + 10
          ? 'warn'
          : 'ok';
  const fill =
    tone === 'crit'
      ? 'from-crit/70 to-crit'
      : tone === 'warn'
        ? 'from-warn/70 to-warn'
        : 'from-brand/60 to-brand';

  return (
    <Panel className={`flex flex-col ${className}`}>
      <PanelHeader
        title="State of charge"
        icon={IconCharge}
        actions={
          soc !== null && reserve !== null ? (
            <Badge tone={tone === 'ok' ? 'ok' : tone} size="xs">
              {soc >= reserve ? 'Above reserve' : 'Below reserve'}
            </Badge>
          ) : undefined
        }
      />

      <div className="flex items-baseline gap-2 animate-rise-in">
        <span className="metric-display text-[68px] sm:text-[76px]">{fixed(soc, 1)}</span>
        {soc !== null && <span className="text-[22px] font-medium text-ink-3 leading-none">%</span>}
      </div>

      {storedKwh !== null && ratedKwh !== null ? (
        <p className="mt-3.5 text-[13px] text-ink-3 leading-relaxed">
          <span className="data-technical text-ink-2">{storedKwh.toFixed(1)} kWh</span> stored of{' '}
          <span className="data-technical text-ink-2">{ratedKwh.toLocaleString()} kWh</span> usable
        </p>
      ) : (
        <p className="mt-3.5 text-[13px] text-ink-4 leading-relaxed">
          {soc === null ? 'Waiting for the first state-of-charge reading.' : 'Stored and usable energy not reported.'}
        </p>
      )}

      {/* Charge track. The reserve floor is marked so the number is read
          against the limit that actually matters operationally. */}
      <div className="mt-auto pt-6">
        <div className="relative h-2 rounded-full bg-veil-2 overflow-hidden">
          {soc !== null && (
            <span
              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${fill}`}
              style={{
                width: `${Math.min(100, Math.max(0, soc))}%`,
                transition: 'width 820ms var(--ease-out-soft)',
              }}
            />
          )}
        </div>
        {reserve !== null && (
          <div className="relative h-0">
            <span
              aria-hidden="true"
              className="absolute -top-[13px] w-px h-3.5 bg-ink-4"
              style={{ left: `${reserve}%` }}
            />
          </div>
        )}
        <div className="flex justify-between mt-2.5">
          <span className="label-technical">0%</span>
          {reserve !== null && <span className="label-technical">reserve {reserve}%</span>}
          <span className="label-technical">100%</span>
        </div>
      </div>
    </Panel>
  );
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
  value: string;
  unit?: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  trend?: number[];
  tone?: 'default' | 'ok' | 'warn' | 'crit' | 'info';
  hint?: string;
}) {
  const missing = value === '—';
  return (
    <div className="min-w-0">
      <Readout
        label={label}
        value={value}
        unit={missing ? undefined : unit}
        icon={icon}
        tone={missing ? 'default' : tone}
        hint={missing ? 'Not reported' : hint}
      />
      {trend && trend.length > 1 && (
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
  className = '',
}: {
  charged: number;
  discharged: number;
  className?: string;
}) {
  const net = charged - discharged;
  const roundTrip = charged > 0 ? (discharged / charged) * 100 : 0;
  const total = charged + discharged || 1;

  return (
    <Panel className={`flex flex-col justify-between ${className}`}>
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

      <div className="flex items-start justify-between gap-3">
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
      <div className="flex h-2.5 rounded-full overflow-hidden bg-veil-2 mt-4 mb-2.5">
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

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-line">
        <span className="label-technical">Round trip</span>
        <span className="data-technical text-[13px] font-medium text-ink">
          {roundTrip.toFixed(1)}
          <span className="text-[11px] text-ink-4 ml-0.5">%</span>
        </span>
      </div>
    </Panel>
  );
}
