import { useMemo } from 'react';
import StatusCard from '../StatusCard';
import GaugeCard from '../GaugeCard';
import TemperatureCard from '../TemperatureCard';
import ProtectionCard from '../ProtectionCard';
import ChartCard from '../ChartCard';
import AlertCard, { AlertItem } from '../AlertCard';
import QuickActionCard from '../QuickActionCard';
import { Panel, PanelHeader } from '../ui/Panel';
import { Readout, Meter } from '../ui/Metric';
import Sparkline from '../ui/Sparkline';
import { Badge } from '../ui/Badge';
import {
  IconVoltage,
  IconCurrent,
  IconPower,
  IconHealth,
  IconCycle,
  IconImbalance,
  IconTrend,
  IconBars,
  IconCharge,
} from '../icons';

/* =============================================================================
   BmsOverview

   Answers, in reading order: is the pack alright → what is it doing right now →
   how is charge and health trending → is the spread healthy → what is protecting
   it → what changed recently.

   The layout is intentionally uneven. A row of six identical tiles would imply
   six equally important facts; here the status panel and the live telemetry
   block dominate, spread and protection sit at half weight, and history and
   alerts anchor the bottom.
   ========================================================================== */

// Mock Data
const alertsData: AlertItem[] = [
  {
    type: 'warning',
    message: 'Module 3 Temperature High',
    time: '2 minutes ago',
    source: 'Rack 1 · Module 03',
    code: 'OT-1140',
    detail:
      'NTC 4 reported 38.5 °C, 3.5 °C above the module mean. Airflow at the rack inlet should be checked before the next charge cycle.',
  },
  {
    type: 'fault',
    message: 'Cell 12 Voltage Low',
    time: '15 minutes ago',
    source: 'Rack 1 · Module 01 · Cell 12',
    code: 'UV-2101',
    detail:
      'Cell held 3,420 mV under load, 280 mV below the module mean. Balancing has been requested; if the spread persists across two cycles the cell should be flagged for replacement.',
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

const cellVoltageData = [40, 45, 42, 60, 80, 50, 45, 42, 55, 65, 50, 40, 42, 45, 60, 45];
const tempTrendData = [30, 32, 35, 38, 40, 42, 41, 39, 38, 37, 35, 33];
const socTrendData = [90, 88, 85, 82, 80, 78, 75, 74, 82, 85, 88, 92];

/** Short trailing windows shown beside the live values. */
const TRENDS = {
  voltage: [52.4, 52.5, 52.6, 52.7, 52.6, 52.8, 52.9, 52.8],
  current: [16.2, 17.1, 17.8, 18.4, 18.9, 18.7, 18.5, 18.6],
  power: [0.86, 0.9, 0.94, 0.97, 1.0, 0.99, 0.97, 0.98],
  soh: [98, 98, 97, 97, 97, 97, 97, 97],
};

/** Twelve two-hourly marks, so the 24 h charts carry real time labels. */
const HOURS = Array.from({ length: 12 }, (_, i) => `${String((i * 2) % 24).padStart(2, '0')}:00`);
const CELL_LABELS = Array.from({ length: 16 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`);

interface BmsOverviewProps {
  deviceId?: string;
}

export function BmsOverview({ deviceId }: BmsOverviewProps) {
  const cellStats = useMemo(() => {
    const highest = 3760;
    const lowest = 3420;
    const mean = 3698;
    return { highest, lowest, mean, delta: highest - lowest };
  }, []);

  return (
    <div className="space-y-5">
      {/* ---------------------------------------------- State & live telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <StatusCard
          status="Normal"
          mode="Discharging"
          detail="48 of 48 modules reporting. One cell is under review for voltage spread."
          facts={[
            { label: 'Uptime', value: '42d 06h' },
            { label: 'Last frame', value: '0.4s ago' },
            { label: 'Firmware', value: 'v2.14.3' },
            { label: 'Device', value: deviceId || 'BMS-101' },
          ]}
          className="lg:col-span-4"
        />

        <Panel className="lg:col-span-8">
          <PanelHeader
            title="Live telemetry"
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
              label="Pack voltage"
              value="52.8"
              unit="V"
              icon={IconVoltage}
              trend={TRENDS.voltage}
              tone="ok"
            />
            <LiveMetric
              label="Pack current"
              value="18.6"
              unit="A"
              icon={IconCurrent}
              trend={TRENDS.current}
              tone="info"
              hint="Discharge"
            />
            <LiveMetric
              label="Power output"
              value="0.98"
              unit="kW"
              icon={IconPower}
              trend={TRENDS.power}
              tone="ok"
            />
            <LiveMetric
              label="State of health"
              value="97"
              unit="%"
              icon={IconHealth}
              trend={TRENDS.soh}
              tone="ok"
            />
            <LiveMetric label="Cycle count" value="412" icon={IconCycle} hint="of 6,000 rated" />
            <LiveMetric
              label="Cell spread"
              value={cellStats.delta}
              unit="mV"
              icon={IconImbalance}
              tone="warn"
              hint="Threshold 250 mV"
            />
          </div>
        </Panel>
      </div>

      {/* ---------------------------------------------- Charge, thermal, spread */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GaugeCard
          title="State of charge"
          percentage={82}
          tone="brand"
          threshold={20}
          icon={IconCharge}
          caption={
            <span>
              <span className="data-technical text-ink-2">7.4 kWh</span> usable · reserve at 20%
            </span>
          }
        />

        <GaugeCard
          title="State of health"
          percentage={97}
          tone="ok"
          icon={IconHealth}
          caption={
            <span>
              <span className="data-technical text-ink-2">412</span> cycles · 3% capacity fade
            </span>
          }
        />

        <TemperatureCard
          max={42}
          min={28}
          avg={33.4}
          hottestSource="Rack 1 · Module 03"
          range={[10, 60]}
        />

        <CellSpreadPanel {...cellStats} />
      </div>

      {/* ---------------------------------------------- Protection & history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <ProtectionCard
          state="Connected"
          insulation={842}
          protections={[
            { label: 'Over-voltage', state: 'armed' },
            { label: 'Under-voltage', state: 'armed' },
            { label: 'Over-temp', state: 'armed' },
            { label: 'Over-current', state: 'armed' },
            { label: 'Short circuit', state: 'armed' },
            { label: 'Isolation', state: 'armed' },
          ]}
          className="lg:col-span-4"
        />

        <ChartCard
          title="State of charge"
          type="line"
          data={socTrendData}
          labels={HOURS}
          unit="%"
          color="#10B981"
          domain={[60, 100]}
          reference={{ value: 20, label: 'Reserve' }}
          caption="Last 24 hours. A single deep discharge overnight, recovered on the morning charge window."
          icon={IconTrend}
          height={200}
          className="lg:col-span-8"
        />
      </div>

      {/* ---------------------------------------------- Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <ChartCard
          title="Cell voltage distribution"
          type="bar"
          data={cellVoltageData}
          labels={CELL_LABELS}
          unit="mV above 3,650"
          color="#10B981"
          caption="Deviation of each cell from the pack floor. Amber bars sit more than one standard deviation from the mean."
          icon={IconBars}
          height={210}
          className="lg:col-span-7"
        />

        <ChartCard
          title="Temperature trend"
          type="line"
          data={tempTrendData}
          labels={HOURS}
          unit="°C"
          color="#F59E0B"
          reference={{ value: 45, label: 'Limit' }}
          caption="Peak probe across the pack. The mid-afternoon rise tracks the discharge window."
          height={210}
          className="lg:col-span-5"
        />
      </div>

      {/* ---------------------------------------------- Events & actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <AlertCard alerts={alertsData} className="lg:col-span-8" />
        <QuickActionCard className="lg:col-span-4" />
      </div>

    </div>
  );
}

/* -----------------------------------------------------------------------------
   LiveMetric — a value with its recent trajectory, used only inside the
   telemetry panel where six of them share one surface.
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
   CellSpreadPanel

   Voltage spread is the single most predictive pack-health signal, so it gets
   its own panel rather than living as one number in a strip. The band shows
   min → max against the full cell operating window with the mean marked.
   -------------------------------------------------------------------------- */

function CellSpreadPanel({
  highest,
  lowest,
  mean,
  delta,
}: {
  highest: number;
  lowest: number;
  mean: number;
  delta: number;
}) {
  const floor = 3200;
  const ceiling = 3900;
  const tone = delta > 250 ? 'warn' : 'ok';

  return (
    <Panel className="flex flex-col">
      <PanelHeader
        title="Cell spread"
        icon={IconImbalance}
        actions={
          <Badge tone={tone} size="xs">
            Δ{delta} mV
          </Badge>
        }
      />

      <div className="flex items-start justify-between gap-3 mb-5">
        <Readout label="High" value={highest} unit="mV" tone="ok" />
        <Readout label="Mean" value={mean} unit="mV" />
        <Readout label="Low" value={lowest} unit="mV" tone={tone} align="right" />
      </div>

      <div className="mt-auto">
        <Meter
          value={highest}
          from={lowest}
          min={floor}
          max={ceiling}
          tone={tone}
          height={6}
          label="Cell voltage spread"
        />
        <div className="flex justify-between mt-2.5">
          <span className="data-technical text-[10px] text-ink-4">{floor} mV</span>
          <span className="label-technical">Cell window</span>
          <span className="data-technical text-[10px] text-ink-4">{ceiling} mV</span>
        </div>
      </div>

      <p className="mt-3 pt-3 border-t border-line text-[11.5px] text-ink-3">
        Widest cell at <span className="data-technical text-ink-2">Module 01 · Cell 12</span>
      </p>
    </Panel>
  );
}
