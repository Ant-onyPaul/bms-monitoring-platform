import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { compressTimeSeries } from '../../utils/timeSeries';
import { Panel, PanelHeader } from '../ui/Panel';
import { Readout } from '../ui/Metric';
import { Badge } from '../ui/Badge';
import PageHeader from '../PageHeader';
import { axisProps, gridProps, ChartTooltip, Y_AXIS_WIDTH, CHART_MARGIN, niceDomain } from '../ui/chartTheme';
import {
  IconHistory,
  IconCharge,
  IconVoltage,
  IconTemperature,
  IconClock,
} from '../icons';

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

/**
 * Deterministic pseudo-random walk.
 *
 * Seeded so a given range always renders the same history — a chart that
 * reshuffles itself on every re-render is worse than useless for diagnosis.
 */
function buildSeries(
  points: number,
  stepMinutes: number,
  seed: number,
  base: number,
  amplitude: number,
) {
  let state = seed;
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  const start = Date.UTC(2026, 6, 27, 0, 0, 0);
  return Array.from({ length: points }, (_, index) => {
    const t = index / (points - 1);
    const cycle = Math.sin(t * Math.PI * 2 - Math.PI / 2);
    const noise = (next() - 0.5) * amplitude * 0.35;
    const time = new Date(start + index * stepMinutes * 60_000);

    return {
      t: time.getTime(),
      label:
        stepMinutes >= 1440
          ? time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
          : time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      value: Number((base + cycle * amplitude + noise).toFixed(2)),
    };
  });
}

const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

interface BmsHistoryProps {
  deviceId?: string;
}

/* =============================================================================
   BmsHistory

   The platform stores telemetry as intervals rather than samples: a value is
   written once and held until it changes meaningfully. That storage model is
   the subject of this view, so the charge history is drawn as a step line —
   the honest shape for held values — while voltage and thermal history, which
   are continuously sampled, are drawn as curves.
   ========================================================================== */

export function BmsHistory({ deviceId }: BmsHistoryProps) {
  const [range, setRange] = useState<RangeId>('24h');
  const activeRange = RANGES.find((r) => r.id === range)!;

  const compressedSeries = compressTimeSeries(rawSampleData, { threshold: 0.3 });

  const compressionRatio = Math.round(
    (1 - compressedSeries.length / rawSampleData.length) * 100,
  );

  /* The stored intervals, shaped for a step chart.
     A step series draws each value forward to the *next* x, so the final
     interval — the open one — would otherwise render as a detached dot with no
     segment. Repeating its value at "now" gives the last step somewhere to run,
     which is also what the open interval actually means. */
  const storedChartData = useMemo(() => {
    const points = compressedSeries.map((segment: any) => ({
      label: formatClock(segment.startTime),
      value: segment.value,
    }));
    const last = compressedSeries[compressedSeries.length - 1] as any;
    if (last) points.push({ label: 'now', value: last.value });
    return points;
  }, [compressedSeries]);

  const voltageSeries = useMemo(
    () => buildSeries(activeRange.points, activeRange.stepMinutes, 7331, 52.6, 0.9),
    [activeRange],
  );
  const thermalSeries = useMemo(
    () => buildSeries(activeRange.points, activeRange.stepMinutes, 991, 34, 6),
    [activeRange],
  );

  const socValues = compressedSeries.map((s: any) => s.value);
  const socHigh = Math.max(...socValues);
  const socLow = Math.min(...socValues);

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

      {/* ------------------------------------------------ Charge history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        <Panel className="lg:col-span-8">
          <PanelHeader
            title="State of charge · stored intervals"
            icon={IconCharge}
            meta="in %"
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

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storedChartData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="soc-history" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis
                  {...axisProps}
                  width={Y_AXIS_WIDTH}
                  domain={niceDomain(socLow, socHigh)}
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
                  stroke="#10B981"
                  strokeWidth={1.75}
                  fill="url(#soc-history)"
                  dot={{ r: 2.5, fill: '#10B981', strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: '#10B981', stroke: 'var(--color-surface)', strokeWidth: 2 }}
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Storage economics */}
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
                <Badge tone={segment.endTime ? 'neutral' : 'ok'} size="xs" dot live={!segment.endTime}>
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

      {/* ------------------------------------------------ Continuous telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TrendPanel
          title="Pack voltage"
          icon={IconVoltage}
          unit="V"
          color="#3B82F6"
          data={voltageSeries}
          caption={`Sampled continuously across the last ${activeRange.label.replace(' ', '')}.`}
        />

        <TrendPanel
          title="Pack temperature"
          icon={IconTemperature}
          unit="°C"
          color="#F59E0B"
          data={thermalSeries}
          reference={{ value: 45, label: 'Limit' }}
          caption="Peak probe across all modules, against the configured thermal limit."
        />
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   RangeToggle — a segmented control. The active segment is a filled chip so the
   selected range is legible without relying on a subtle weight change.
   -------------------------------------------------------------------------- */

function RangeToggle({ value, onChange }: { value: RangeId; onChange: (id: RangeId) => void }) {
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
            className={`
              h-7 px-3 rounded-[5px] text-[12px] font-medium cursor-pointer
              transition-[background-color,color,box-shadow] duration-150
              [transition-timing-function:var(--ease-precise)]
              focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand
              ${
                isActive
                  ? 'bg-surface text-ink shadow-[var(--shadow-e1)]'
                  : 'text-ink-3 hover:text-ink'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function TrendPanel({
  title,
  icon,
  unit,
  color,
  data,
  caption,
  reference,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  unit: string;
  color: string;
  data: { label: string; value: number }[];
  caption: string;
  reference?: { value: number; label: string };
}) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <Panel>
      <PanelHeader title={title} icon={icon} meta={`in ${unit}`} />
      <p className="-mt-2 mb-4 text-[12px] text-ink-3 leading-relaxed">{caption}</p>

      <div className="flex items-start gap-8 mb-4">
        <Readout label="Min" value={min.toFixed(1)} unit={unit} size="sm" />
        <Readout label="Mean" value={mean.toFixed(1)} unit={unit} size="sm" />
        <Readout
          label="Max"
          value={max.toFixed(1)}
          unit={unit}
          size="sm"
          tone={reference && max >= reference.value ? 'crit' : 'default'}
        />
      </div>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} minTickGap={28} />
            <YAxis {...axisProps} width={Y_AXIS_WIDTH} domain={niceDomain(min, max)} tickCount={5} />
            <Tooltip
              content={<ChartTooltip unit={unit} />}
              cursor={{ stroke: 'var(--color-line-2)', strokeWidth: 1 }}
            />
            {reference && (
              <ReferenceLine
                y={reference.value}
                stroke="var(--color-crit)"
                strokeDasharray="3 3"
                label={{
                  value: reference.label,
                  position: 'insideTopRight',
                  fill: 'var(--color-crit-ink)',
                  fontSize: 10,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              name={title}
              stroke={color}
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3.5, fill: color, stroke: 'var(--color-surface)', strokeWidth: 2 }}
              animationDuration={700}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
