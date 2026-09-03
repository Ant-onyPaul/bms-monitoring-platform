import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { compressTimeSeries } from '../../utils/timeSeries';
import { buildSeries, getSystemTelemetry } from '../../data/bmsTelemetry';
import ChartCard from '../ChartCard';
import { Panel, PanelHeader } from '../ui/Panel';
import { Readout } from '../ui/Metric';
import { Badge } from '../ui/Badge';
import PageHeader from '../PageHeader';
import {
  axisProps,
  gridProps,
  ChartTooltip,
  Y_AXIS_WIDTH,
  CHART_MARGIN,
  niceDomain,
  chartColors,
} from '../ui/chartTheme';
import { IconCharge, IconCurrent, IconTemperature, IconClock } from '../icons';

/* =============================================================================
   BmsHistory

   Two kinds of history, drawn differently because they are stored differently.

   The platform writes state of charge as *intervals* — a value is recorded once
   and held until it moves past the write threshold — so it is drawn as a step
   line, the honest shape for held values. Current and temperature are sampled
   continuously and are drawn as curves.

   Every chart carries its measure and unit beside the title and an explicit
   axis caption underneath, so no chart depends on a hover to be readable.
   ========================================================================== */

const rawSampleData = [
  { timestamp: '2026-07-27T00:00:00Z', value: 78.2 },
  { timestamp: '2026-07-27T00:15:00Z', value: 78.2 },
  { timestamp: '2026-07-27T00:30:00Z', value: 78.5 },
  { timestamp: '2026-07-27T00:45:00Z', value: 78.5 },
  { timestamp: '2026-07-27T01:00:00Z', value: 77.9 },
  { timestamp: '2026-07-27T01:15:00Z', value: 77.9 },
  { timestamp: '2026-07-27T01:30:00Z', value: 79.1 },
  { timestamp: '2026-07-27T01:45:00Z', value: 79.1 },
];

const RANGES = [
  { id: '24h', label: '24 h', points: 24, stepMinutes: 60 },
  { id: '7d', label: '7 d', points: 28, stepMinutes: 360 },
  { id: '30d', label: '30 d', points: 30, stepMinutes: 1440 },
] as const;

type RangeId = (typeof RANGES)[number]['id'];

const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

interface BmsHistoryProps {
  deviceId?: string;
}

export function BmsHistory({ deviceId }: BmsHistoryProps) {
  const key = deviceId || 'default';
  const [range, setRange] = useState<RangeId>('24h');
  const activeRange = RANGES.find((r) => r.id === range)!;

  const telemetry = useMemo(() => getSystemTelemetry(key), [key]);
  const rack1 = telemetry.racks[0];
  const rack2 = telemetry.racks[1];

  /* ---------------------------------------------- Interval-stored SOC */
  const compressedSeries = compressTimeSeries(rawSampleData, { threshold: 0.3 });
  const compressionRatio = Math.round((1 - compressedSeries.length / rawSampleData.length) * 100);

  /* A step series draws each value forward to the next x, so the final open
     interval would otherwise be a detached dot. Repeating its value at "now"
     gives the last step somewhere to run — which is what "open" means. */
  const storedChartData = useMemo(() => {
    const points = compressedSeries.map((segment: any) => ({
      label: formatClock(segment.startTime),
      value: segment.value,
    }));
    const last = compressedSeries[compressedSeries.length - 1] as any;
    if (last) points.push({ label: 'now', value: last.value });
    return points;
  }, [compressedSeries]);

  const socValues = compressedSeries.map((s: any) => s.value);

  /* ---------------------------------------------- Continuous series
     Rack currents are signed: positive = discharge, negative = charge. Rack 2
     is on charge, so the pair exercises both directions and the zero line
     carries real meaning. */
  const opts = { points: activeRange.points, stepMinutes: activeRange.stepMinutes };

  const systemCurrent = useMemo(
    () =>
      buildSeries(`${key}:sys-current:${range}`, {
        ...opts,
        base: telemetry.batteryCurrent,
        amplitude: 26,
        decimals: 1,
      }),
    [key, range, telemetry.batteryCurrent],
  );

  const rack1Current = useMemo(
    () =>
      buildSeries(`${key}:r1-current:${range}`, {
        ...opts,
        base: rack1.current,
        amplitude: 14,
        decimals: 1,
      }),
    [key, range, rack1.current],
  );

  const rack2Current = useMemo(
    () =>
      buildSeries(`${key}:r2-current:${range}`, {
        ...opts,
        base: rack2.current,
        amplitude: 12,
        phase: Math.PI,
        decimals: 1,
      }),
    [key, range, rack2.current],
  );

  const rack1MaxTemp = useMemo(
    () =>
      buildSeries(`${key}:r1-maxtemp:${range}`, {
        ...opts,
        base: rack1.extremes.maxTemperature.value - 2.5,
        amplitude: 4,
        decimals: 1,
      }),
    [key, range, rack1.extremes.maxTemperature.value],
  );

  const rack2MaxTemp = useMemo(
    () =>
      buildSeries(`${key}:r2-maxtemp:${range}`, {
        ...opts,
        base: rack2.extremes.maxTemperature.value - 2.5,
        amplitude: 3.4,
        phase: Math.PI / 3,
        decimals: 1,
      }),
    [key, range, rack2.extremes.maxTemperature.value],
  );

  return (
    <div>
      <PageHeader
        eyebrow="History & logs"
        title="Stored telemetry"
        description={`Historical behaviour for device ${
          deviceId || 'BMS-101'
        }. Repeated readings are stored once and held until the next meaningful change.`}
        actions={<RangeToggle value={range} onChange={setRange} />}
      />

      {/* ---------------------------------------------- Stored SOC intervals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        <Panel className="lg:col-span-8">
          <PanelHeader
            title="State of charge · stored intervals"
            icon={IconCharge}
            meta="SOC (%)"
            actions={
              <Badge tone="ok" size="xs">
                {compressedSeries.length} intervals
              </Badge>
            }
          />
          <p className="-mt-2 mb-4 text-[12px] text-ink-3 leading-relaxed">
            Each step is one stored value held across its interval. The flat runs are not missing
            data — they are periods where the reading did not move enough to warrant a write.
          </p>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storedChartData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="soc-history" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.ok} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={chartColors.ok} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis
                  {...axisProps}
                  width={Y_AXIS_WIDTH}
                  domain={niceDomain(Math.min(...socValues), Math.max(...socValues))}
                  tickCount={5}
                />
                <Tooltip
                  content={<ChartTooltip unit="%" />}
                  cursor={{ stroke: 'var(--color-line-2)', strokeWidth: 1 }}
                />
                <Area
                  type="stepAfter"
                  dataKey="value"
                  name="State of charge"
                  stroke={chartColors.ok}
                  strokeWidth={1.75}
                  fill="url(#soc-history)"
                  dot={{ r: 2.5, fill: chartColors.ok, strokeWidth: 0 }}
                  activeDot={{
                    r: 4,
                    fill: chartColors.ok,
                    stroke: 'var(--color-surface)',
                    strokeWidth: 2,
                  }}
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center label-technical !text-[9.5px] text-ink-4">Time</p>
        </Panel>

        <Panel flush className="lg:col-span-4 overflow-hidden flex flex-col">
          <div className="px-5 pt-4">
            <PanelHeader title="Interval storage" icon={IconClock} divided />
          </div>

          <div className="grid grid-cols-3 gap-px bg-line">
            <div className="bg-surface px-4 py-3.5">
              <Readout label="Samples" value={rawSampleData.length} size="sm" />
            </div>
            <div className="bg-surface px-4 py-3.5">
              <Readout label="Stored" value={compressedSeries.length} size="sm" tone="ok" />
            </div>
            <div className="bg-surface px-4 py-3.5">
              <Readout label="Saved" value={compressionRatio} unit="%" size="sm" tone="ok" />
            </div>
          </div>

          <ul className="flex-1 overflow-y-auto scrollbar-fine divide-y divide-line max-h-[220px]">
            {compressedSeries.map((segment: any) => (
              <li
                key={`${segment.startTime}-${segment.endTime}`}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-2 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block data-technical text-[15px] font-medium text-ink">
                    {segment.value}
                    <span className="text-[11px] text-ink-4 ml-0.5">%</span>
                  </span>
                  <span className="block data-technical text-[11px] text-ink-4 mt-0.5 truncate">
                    {formatClock(segment.startTime)} →{' '}
                    {segment.endTime ? formatClock(segment.endTime) : 'now'}
                  </span>
                </span>
                <Badge
                  tone={segment.endTime ? 'neutral' : 'ok'}
                  size="xs"
                  dot
                  live={!segment.endTime}
                >
                  {segment.endTime ? 'Closed' : 'Open'}
                </Badge>
              </li>
            ))}
          </ul>

          <p className="mt-auto px-5 py-3.5 border-t border-line text-[11.5px] text-ink-4 leading-relaxed">
            An open interval is the value currently being held. It closes when the reading moves
            past the write threshold.
          </p>
        </Panel>
      </div>

      {/* ---------------------------------------------- System current */}
      <ChartCard
        title="System current"
        type="line"
        data={systemCurrent.map((p) => p.value)}
        labels={systemCurrent.map((p) => p.label)}
        unit="Current (A)"
        xLabel="Time"
        color={chartColors.info}
        zeroLine
        caption="Total battery current across all racks. Positive values are discharge, negative are charge."
        icon={IconCurrent}
        height={200}
        className="mb-5"
      />

      {/* ---------------------------------------------- Per-rack current */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard
          title="Rack 1 current"
          type="line"
          data={rack1Current.map((p) => p.value)}
          labels={rack1Current.map((p) => p.label)}
          unit="Current (A)"
          xLabel="Time"
          color={chartColors.info}
          zeroLine
          caption="Positive values indicate discharge."
          icon={IconCurrent}
          height={190}
        />

        <ChartCard
          title="Rack 2 current"
          type="line"
          data={rack2Current.map((p) => p.value)}
          labels={rack2Current.map((p) => p.label)}
          unit="Current (A)"
          xLabel="Time"
          color={chartColors.violet}
          zeroLine
          caption="Negative values indicate charge."
          icon={IconCurrent}
          height={190}
        />
      </div>

      {/* ---------------------------------------------- Per-rack peak temperature */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Rack 1 maximum temperature"
          type="line"
          data={rack1MaxTemp.map((p) => p.value)}
          labels={rack1MaxTemp.map((p) => p.label)}
          unit="Temperature (°C)"
          xLabel="Time"
          color={chartColors.warn}
          reference={{ value: 45, label: 'Limit' }}
          caption="Hottest cell in Rack 1, against the configured thermal limit."
          icon={IconTemperature}
          height={190}
        />

        <ChartCard
          title="Rack 2 maximum temperature"
          type="line"
          data={rack2MaxTemp.map((p) => p.value)}
          labels={rack2MaxTemp.map((p) => p.label)}
          unit="Temperature (°C)"
          xLabel="Time"
          color={chartColors.warn}
          reference={{ value: 45, label: 'Limit' }}
          caption="Hottest cell in Rack 2, against the configured thermal limit."
          icon={IconTemperature}
          height={190}
        />
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   RangeToggle — a segmented control driving every continuous chart on the page.
   -------------------------------------------------------------------------- */

function RangeToggle({
  value,
  onChange,
}: {
  value: RangeId;
  onChange: (id: RangeId) => void;
}) {
  return (
    <div
      role="group"
      aria-label="History range"
      className="inline-flex items-center p-0.5 rounded-md bg-surface-3 border border-line"
    >
      {RANGES.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={`h-7 px-3 rounded-[5px] text-[12px] font-medium cursor-pointer
              transition-[background-color,color,box-shadow] duration-150
              [transition-timing-function:var(--ease-precise)]
              focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand
              ${isActive ? 'bg-surface text-ink shadow-[var(--shadow-e1)]' : 'text-ink-3 hover:text-ink'}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
