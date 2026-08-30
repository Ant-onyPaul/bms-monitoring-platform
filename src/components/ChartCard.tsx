import React, { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  niceDomain,
  barDomain,
} from './ui/chartTheme';

export interface ChartCardProps {
  title: string;
  type: 'line' | 'bar';
  /** Series values. Index maps to `labels` when supplied. */
  data: number[];
  /** Legacy hex colour; still honoured. */
  color?: string;
  /** Axis/tooltip unit, e.g. "%", "mV", "°C". */
  unit?: string;
  /** Real category labels. Falls back to sample indices. */
  labels?: string[];
  /** Explicit Y domain; otherwise derived with headroom. */
  domain?: [number, number];
  /** Horizontal reference, e.g. a mean or a limit. */
  reference?: { value: number; label: string };
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
 * Charts here are instruments, not texture. Every one carries a unit on the Y
 * axis and real category labels on the X axis, and bar charts colour each bar
 * by whether it sits inside the nominal band — so the distribution can be read
 * without hovering anything.
 */
export default function ChartCard({
  title,
  type,
  data,
  color = '#10B981',
  unit = '',
  labels,
  domain,
  reference,
  caption,
  actions,
  height = 220,
  icon,
  className = '',
}: ChartCardProps) {
  const gradientId = useId().replace(/:/g, '');

  const chartData = data.map((value, index) => ({
    name: labels?.[index] ?? `${index + 1}`,
    value,
  }));

  const min = Math.min(...data);
  const max = Math.max(...data);
  const yDomain = domain ?? (type === 'bar' ? barDomain(max) : niceDomain(min, max));

  // Bars outside one standard deviation read as outliers and are tinted amber.
  const mean = data.reduce((a, b) => a + b, 0) / (data.length || 1);
  const deviation = Math.sqrt(
    data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (data.length || 1),
  );

  return (
    <Panel className={`flex flex-col ${className}`}>
      <PanelHeader
        title={title}
        icon={icon}
        meta={unit ? `in ${unit}` : undefined}
        actions={actions}
      />

      {caption && <p className="-mt-2 mb-4 text-[12px] text-ink-3 leading-relaxed">{caption}</p>}

      {/* shrink-0: inside a flex-column Panel that shares a grid row with a
          taller sibling, a growable wrapper collapses the chart to nothing. */}
      <div className="w-full shrink-0 mt-auto" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <AreaChart data={chartData} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.16} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} minTickGap={24} />
              <YAxis {...axisProps} domain={yDomain} width={Y_AXIS_WIDTH} tickCount={5} />
              <Tooltip
                content={<ChartTooltip unit={unit} />}
                cursor={{ stroke: 'var(--color-line-2)', strokeWidth: 1 }}
              />
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
                dataKey="value"
                name={title}
                stroke={color}
                strokeWidth={1.75}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 3.5, fill: color, stroke: 'var(--color-surface)', strokeWidth: 2 }}
                animationDuration={700}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={CHART_MARGIN}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} interval={0} minTickGap={2} />
              <YAxis {...axisProps} domain={yDomain} width={Y_AXIS_WIDTH} tickCount={5} />
              <Tooltip
                content={<ChartTooltip unit={unit} />}
                cursor={{ fill: 'var(--color-surface-3)' }}
              />
              {reference && (
                <ReferenceLine y={reference.value} stroke="var(--color-ink-4)" strokeDasharray="3 3" />
              )}
              <Bar dataKey="value" name={title} radius={[2, 2, 0, 0]} animationDuration={600}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={Math.abs(entry.value - mean) > deviation ? '#F59E0B' : color}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
