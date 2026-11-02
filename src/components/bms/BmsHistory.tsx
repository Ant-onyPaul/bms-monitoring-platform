import { useMemo } from 'react';
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
import ChartCard from '../ChartCard';
import { Panel, PanelHeader } from '../ui/Panel';
import { Readout } from '../ui/Metric';
import { Badge } from '../ui/Badge';
import PageHeader from '../PageHeader';
import { DataUnavailable } from './DataUnavailable';
import {
  axisProps,
  gridProps,
  ChartTooltip,
  Y_AXIS_WIDTH,
  CHART_MARGIN,
  niceDomain,
  chartColors,
} from '../ui/chartTheme';
import { IconCharge, IconCurrent, IconTemperature, IconClock, IconVoltage, IconPower } from '../icons';
import { HISTORY_RANGES, type HistoryData, type HistoryRangeId } from '../../services/deviceData/types';

/* =============================================================================
   BmsHistory

   Two kinds of history, drawn differently because they are stored differently.

   The platform writes state of charge as *intervals* — a value is recorded once
   and held until it moves past the write threshold — so it is drawn as a step
   line, the honest shape for held values. Current and temperature are sampled
   continuously and are drawn as curves.

   Every chart carries its measure and unit beside the title and an explicit
   axis caption underneath, so no chart depends on a hover to be readable.

   Presentation only: series come from `data`. The range toggle appears only
   when the source can serve ranges (`onRangeChange`); sections the source has
   no data for show an empty state in their slot.
   ========================================================================== */

const clock = (withSeconds: boolean) => (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
  });

interface BmsHistoryProps {
  data: HistoryData;
  deviceLabel?: string;
  range?: HistoryRangeId;
  onRangeChange?: (range: HistoryRangeId) => void;
}

interface Interval {
  startTime: string;
  endTime: string | null;
  value: number;
}

export function BmsHistory({ data, deviceLabel, range, onRangeChange }: BmsHistoryProps) {
  const isLive = data.provenance === 'live';
  const formatClock = clock(isLive);

  /* ---------------------------------------------- Interval-stored SOC */
  const compressedSeries = useMemo(
    () => compressTimeSeries(data.socSamples, { threshold: 0.3 }) as Interval[],
    [data.socSamples],
  );
  const sampleCount = data.socSamples.length;
  const compressionRatio = sampleCount
    ? Math.round((1 - compressedSeries.length / sampleCount) * 100)
    : 0;

  /* A step series draws each value forward to the next x, so the final open
     interval would otherwise be a detached dot. Repeating its value at "now"
     gives the last step somewhere to run — which is what "open" means. */
  const storedChartData = useMemo(() => {
    const points = compressedSeries.map((segment) => ({
      label: formatClock(segment.startTime),
      value: segment.value,
    }));
    const last = compressedSeries[compressedSeries.length - 1];
    if (last) points.push({ label: 'now', value: last.value });
    return points;
    // formatClock only varies with provenance, already captured by the series.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compressedSeries]);

  const socValues = compressedSeries.map((s) => s.value);
  const { current, voltage, powerKw } = data.system;

  return (
    <div>
      <PageHeader
        eyebrow="History & logs"
        title="Stored telemetry"
        description={
          isLive
            ? `Recent telemetry messages stored for ${deviceLabel ?? 'this device'}. State of charge is shown as the intervals it is held for.`
            : `Historical behaviour for ${deviceLabel ?? 'this device'}. Repeated readings are stored once and held until the next meaningful change.`
        }
        actions={
          onRangeChange && range ? <RangeToggle value={range} onChange={onRangeChange} /> : undefined
        }
      />

      {/* ---------------------------------------------- Stored SOC intervals */}
      {compressedSeries.length > 0 ? (
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
                <Readout label="Samples" value={sampleCount} size="sm" />
              </div>
              <div className="bg-surface px-4 py-3.5">
                <Readout label="Stored" value={compressedSeries.length} size="sm" tone="ok" />
              </div>
              <div className="bg-surface px-4 py-3.5">
                <Readout label="Saved" value={compressionRatio} unit="%" size="sm" tone="ok" />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto scrollbar-fine divide-y divide-line max-h-[220px]">
              {compressedSeries.map((segment) => (
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
      ) : (
        <DataUnavailable
          compact
          title="State of charge · stored intervals"
          icon={IconCharge}
          message="No stored state-of-charge readings yet."
          className="mb-5"
        />
      )}

      {/* ---------------------------------------------- System current */}
      {current.length > 1 ? (
        <ChartCard
          title="System current"
          type="line"
          data={current.map((p) => p.value)}
          labels={current.map((p) => p.label)}
          unit="Current (A)"
          xLabel="Time"
          color={chartColors.info}
          zeroLine
          caption={data.currentCaption}
          icon={IconCurrent}
          height={200}
          className="mb-5"
        />
      ) : (
        <DataUnavailable
          compact
          title="System current"
          icon={IconCurrent}
          message="No stored current readings yet."
          className="mb-5"
        />
      )}

      {/* ---------------------------------------------- Pack voltage & power
          Shown when the source stores them (the live API does). */}
      {(voltage || powerKw) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {voltage && <SeriesChart title="Pack voltage" unit="Voltage (V)" icon={IconVoltage} color={chartColors.info} series={voltage} caption="Battery terminal voltage from stored telemetry messages." />}
          {powerKw && <SeriesChart title="Battery power" unit="Power (kW)" icon={IconPower} color={chartColors.violet} series={powerKw} zeroLine caption="Battery power from stored telemetry messages." />}
        </div>
      )}

      {/* ---------------------------------------------- Per-rack history */}
      {data.racks ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {data.racks.map((rack, i) => (
              <ChartCard
                key={rack.name}
                title={`${rack.name} current`}
                type="line"
                data={rack.current.map((p) => p.value)}
                labels={rack.current.map((p) => p.label)}
                unit="Current (A)"
                xLabel="Time"
                color={i % 2 ? chartColors.violet : chartColors.info}
                zeroLine
                caption={i % 2 ? 'Negative values indicate charge.' : 'Positive values indicate discharge.'}
                icon={IconCurrent}
                height={190}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {data.racks.map((rack) => (
              <ChartCard
                key={rack.name}
                title={`${rack.name} maximum temperature`}
                type="line"
                data={rack.maxTemperature.map((p) => p.value)}
                labels={rack.maxTemperature.map((p) => p.label)}
                unit="Temperature (°C)"
                xLabel="Time"
                color={chartColors.warn}
                reference={{ value: 45, label: 'Limit' }}
                caption={`Hottest cell in ${rack.name}, against the configured thermal limit.`}
                icon={IconTemperature}
                height={190}
              />
            ))}
          </div>
        </>
      ) : (
        <DataUnavailable
          compact
          title="Per-rack current and temperature"
          icon={IconTemperature}
          message="Rack-level history needs rack data from the backend, e.g. GET /api/devices/:id/racks with stored history."
        />
      )}
    </div>
  );
}

function SeriesChart({
  title,
  unit,
  icon,
  color,
  series,
  caption,
  zeroLine = false,
}: {
  title: string;
  unit: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  color: string;
  series: { label: string; value: number }[];
  caption: string;
  zeroLine?: boolean;
}) {
  if (series.length < 2) {
    return <DataUnavailable compact title={title} icon={icon} message={`No stored ${title.toLowerCase()} readings yet.`} />;
  }
  return (
    <ChartCard
      title={title}
      type="line"
      data={series.map((p) => p.value)}
      labels={series.map((p) => p.label)}
      unit={unit}
      xLabel="Time"
      color={color}
      zeroLine={zeroLine}
      caption={caption}
      icon={icon}
      height={190}
    />
  );
}

/* -----------------------------------------------------------------------------
   RangeToggle — a segmented control driving every continuous chart on the page.
   -------------------------------------------------------------------------- */

function RangeToggle({
  value,
  onChange,
}: {
  value: HistoryRangeId;
  onChange: (id: HistoryRangeId) => void;
}) {
  return (
    <div
      role="group"
      aria-label="History range"
      className="inline-flex items-center p-0.5 rounded-md bg-surface-3 border border-line"
    >
      {HISTORY_RANGES.map((option) => {
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
