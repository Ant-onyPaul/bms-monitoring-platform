import React, { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Panel, PanelHeader } from './ui/Panel';
import {
  axisProps,
  gridProps,
  ChartTooltip,
  Y_AXIS_WIDTH,
  CHART_MARGIN,
  niceAxis,
  barDomain,
  LegendSwatches,
} from './ui/chartTheme';

/** One plotted series. Used when a chart carries more than a single measure. */
export interface ChartSeries {
  key: string;
  /** Legend and tooltip label. */
  name: string;
  color: string;
  data: number[];
  /** Overrides the card's `type` for this series, e.g. a line over bars. */
  type?: 'line' | 'bar' | 'area';
}

export interface ChartCardProps {
  title: string;
  type: 'line' | 'bar';
  /** Single-series values. Index maps to `labels` when supplied. */
  data?: number[];
  /** Multi-series form. Takes precedence over `data` and enables the legend. */
  series?: ChartSeries[];
  /** Legacy hex colour for the single-series form. */
  color?: string;
  /** Measure and unit for the Y axis, e.g. "Current (A)". Shown beside the title. */
  unit?: string;
  /** Caption under the X axis, e.g. "Time" or "Date". */
  xLabel?: string;
  /** Real category labels. Falls back to sample indices. */
  labels?: string[];
  /** Explicit Y domain; otherwise derived with headroom. */
  domain?: [number, number];
  /** Horizontal reference, e.g. a mean or a limit. */
  reference?: { value: number; label: string };
  /** Draws a zero line — essential where sign carries meaning (charge vs discharge). */
  zeroLine?: boolean;
  /** Sentence under the header explaining what the reader is looking at. */
  caption?: string;
  /** Trailing header controls. */
  actions?: React.ReactNode;
  height?: number;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  className?: string;
}

/**
 * ChartCard
 *
 * Charts here are instruments, not texture. Every one carries its measure and
 * unit beside the title, real category labels on the X axis, and an explicit
 * axis caption — so the chart can be read without hovering anything.
 *
 * Bar charts are zero-based (length encodes magnitude, so a truncated axis
 * would lie); line charts may be zoomed to their range.
 */
export default function ChartCard({
  title,
  type,
  data,
  series,
  color = '#10B981',
  unit = '',
  xLabel,
  labels,
  domain,
  reference,
  zeroLine = false,
  caption,
  actions,
  height = 220,
  icon,
  className = '',
}: ChartCardProps) {
  const gradientId = useId().replace(/:/g, '');

  // Normalise both input forms into one series list.
  const resolved: ChartSeries[] =
    series && series.length > 0
      ? series
      : [{ key: 'value', name: title, color, data: data ?? [] }];

  const length = Math.max(...resolved.map((s) => s.data.length), 0);

  const chartData = Array.from({ length }, (_, index) => {
    const row: Record<string, string | number> = {
      name: labels?.[index] ?? `${index + 1}`,
    };
    resolved.forEach((s) => {
      row[s.key] = s.data[index];
    });
    return row;
  });

  const allValues = resolved.flatMap((s) => s.data).filter((v) => Number.isFinite(v));
  const min = allValues.length ? Math.min(...allValues) : 0;
  const max = allValues.length ? Math.max(...allValues) : 1;

  const derived = type === 'bar' && min >= 0 ? { domain: barDomain(max), ticks: undefined } : niceAxis(min, max);
  const yDomain = domain ?? derived.domain;
  // Explicit ticks only when we derived the domain ourselves.
  const yTicks = domain ? undefined : derived.ticks;

  // Single-series bars tint outliers so the distribution reads without hovering.
  const isSingle = resolved.length === 1;
  const mean = allValues.reduce((a, b) => a + b, 0) / (allValues.length || 1);
  const deviation = Math.sqrt(
    allValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (allValues.length || 1),
  );

  const showLegend = resolved.length > 1;

  return (
    <Panel className={`flex flex-col ${className}`}>
      <PanelHeader
        title={title}
        icon={icon}
        meta={unit || undefined}
        actions={actions}
      />

      {caption && <p className="-mt-2 mb-3 text-[12px] text-ink-3 leading-relaxed">{caption}</p>}

      {showLegend && (
        <LegendSwatches
          className="mb-3"
          items={resolved.map((s) => ({ color: s.color, label: s.name }))}
        />
      )}

      <div className="w-full shrink-0 mt-auto" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' && isSingle ? (
            <AreaChart data={chartData} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={resolved[0].color} stopOpacity={0.16} />
                  <stop offset="100%" stopColor={resolved[0].color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} minTickGap={24} />
              <YAxis {...axisProps} domain={yDomain} ticks={yTicks} width={Y_AXIS_WIDTH} tickCount={5} />
              <Tooltip
                content={<ChartTooltip unit={unit} />}
                cursor={{ stroke: 'var(--color-line-2)', strokeWidth: 1 }}
              />
              {zeroLine && <ReferenceLine y={0} stroke="var(--color-line-3)" strokeWidth={1} />}
              {reference && (
                <ReferenceLine
                  y={reference.value}
                  stroke="var(--color-ink-4)"
                  strokeDasharray="3 3"
                  label={{
                    value: reference.label,
                    position: 'insideTopRight',
                    fill: 'var(--color-ink-4)',
                    fontSize: 10,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey={resolved[0].key}
                name={resolved[0].name}
                stroke={resolved[0].color}
                strokeWidth={1.75}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 3.5,
                  fill: resolved[0].color,
                  stroke: 'var(--color-surface)',
                  strokeWidth: 2,
                }}
                animationDuration={700}
              />
            </AreaChart>
          ) : type === 'bar' && isSingle ? (
            <BarChart data={chartData} margin={CHART_MARGIN}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} interval={0} minTickGap={2} />
              <YAxis {...axisProps} domain={yDomain} ticks={yTicks} width={Y_AXIS_WIDTH} tickCount={5} />
              <Tooltip
                content={<ChartTooltip unit={unit} />}
                cursor={{ fill: 'var(--color-surface-3)' }}
              />
              {reference && (
                <ReferenceLine y={reference.value} stroke="var(--color-ink-4)" strokeDasharray="3 3" />
              )}
              <Bar
                dataKey={resolved[0].key}
                name={resolved[0].name}
                radius={[2, 2, 0, 0]}
                animationDuration={600}
              >
                {chartData.map((row, index) => (
                  <Cell
                    key={index}
                    fill={
                      Math.abs(Number(row[resolved[0].key]) - mean) > deviation
                        ? '#F59E0B'
                        : resolved[0].color
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            /* Multi-series: one composed chart so bars and lines can share axes. */
            <ComposedChart data={chartData} margin={CHART_MARGIN}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} minTickGap={16} />
              <YAxis {...axisProps} domain={yDomain} ticks={yTicks} width={Y_AXIS_WIDTH} tickCount={5} />
              <Tooltip
                content={<ChartTooltip unit={unit} />}
                cursor={{ fill: 'var(--color-surface-3)' }}
              />
              {zeroLine && <ReferenceLine y={0} stroke="var(--color-line-3)" strokeWidth={1} />}
              {reference && (
                <ReferenceLine
                  y={reference.value}
                  stroke="var(--color-ink-4)"
                  strokeDasharray="3 3"
                  label={{
                    value: reference.label,
                    position: 'insideTopRight',
                    fill: 'var(--color-ink-4)',
                    fontSize: 10,
                  }}
                />
              )}
              {resolved.map((s) => {
                const kind = s.type ?? type;
                if (kind === 'line') {
                  return (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.name}
                      stroke={s.color}
                      strokeWidth={1.75}
                      dot={false}
                      activeDot={{
                        r: 3.5,
                        fill: s.color,
                        stroke: 'var(--color-surface)',
                        strokeWidth: 2,
                      }}
                      animationDuration={700}
                    />
                  );
                }
                return (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.name}
                    fill={s.color}
                    radius={[2, 2, 0, 0]}
                    animationDuration={600}
                  />
                );
              })}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {xLabel && (
        <p className="mt-2 text-center label-technical !text-[9.5px] text-ink-4">{xLabel}</p>
      )}
    </Panel>
  );
}
