import React from 'react';

/* -----------------------------------------------------------------------------
   Shared Recharts configuration.

   Centralised so every chart in the product shares one grid weight, one tick
   treatment and one tooltip. Charts here always carry units and real time
   labels — a chart that cannot be read off is decoration, and we do not ship it.
   -------------------------------------------------------------------------- */

/* Series colours resolve from theme tokens rather than literals, so a chart
   re-themes with the rest of the app and no component has to know which theme
   is active. Recharts resolves var() in its presentation attributes. */
export const chartColors = {
  ok: 'var(--color-chart-ok)',
  warn: 'var(--color-chart-warn)',
  crit: 'var(--color-chart-crit)',
  info: 'var(--color-chart-info)',
  ink: 'var(--color-chart-ink)',
  violet: 'var(--color-chart-violet)',
};

export const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 10, fill: 'var(--color-ink-4)', fontFamily: 'var(--font-mono)' },
  stroke: 'var(--color-line)',
} as const;

/** Y-axis gutter. Wide enough that a 4-character tick ("3900", "100") is never
 *  clipped to a leading-dot fragment. */
export const Y_AXIS_WIDTH = 52;

/** Left chart margin that pairs with Y_AXIS_WIDTH without stranding whitespace. */
export const CHART_MARGIN = { top: 6, right: 16, left: -14, bottom: 0 } as const;

export const gridProps = {
  stroke: 'var(--color-line)',
  strokeDasharray: '2 4',
  vertical: false,
} as const;

/** Picks the nearest 1/2/2.5/5/10 step at the magnitude of `rough`. */
function niceStep(rough: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(Math.abs(rough) || 1));
  return (
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude
  );
}

/**
 * Rounds a series' range out to a domain whose ticks land on human numbers.
 *
 * Feeding Recharts a raw min/max produces axis labels like 51.95 and 53.45,
 * which read as noise. The step is derived from the *unpadded* range so the
 * bounds stay close to the data — deriving it from a padded range compounds the
 * rounding and can double the axis, flattening the series into a corner.
 */
export function niceDomain(min: number, max: number): [number, number] {
  const step = niceStep((max - min || Math.abs(max) || 1) / 4);
  const round = (n: number) => Number(n.toFixed(6));

  let low = Math.floor(min / step) * step;
  let high = Math.ceil(max / step) * step;

  // Guarantee headroom so the series never touches the frame.
  if (round(low) === round(min)) low -= step;
  if (round(high) === round(max)) high += step;

  return [round(low), round(high)];
}

/**
 * Domain plus the exact ticks that go with it.
 *
 * Passing Recharts a domain alone lets it re-derive its own ticks, which can
 * land on uneven spacing (35 / 38 / 41 / 45). Supplying both keeps the gaps
 * equal, which is the whole point of a linear axis.
 */
export function niceAxis(min: number, max: number): { domain: [number, number]; ticks: number[] } {
  const domain = niceDomain(min, max);
  const step = niceStep((domain[1] - domain[0]) / 4);
  const ticks: number[] = [];
  for (let v = domain[0]; v <= domain[1] + step / 1000; v += step) {
    ticks.push(Number(v.toFixed(6)));
  }
  return { domain, ticks };
}

/**
 * Bar charts get a zero baseline.
 *
 * Bar length encodes magnitude, so truncating the axis exaggerates differences
 * — a 5% spread can be made to look like a 5x one. Lines encode change and may
 * legitimately be zoomed; bars may not.
 */
export function barDomain(max: number): [number, number] {
  const step = niceStep(max / 4);
  return [0, Number((Math.ceil(max / step) * step).toFixed(6))];
}

/** Opaque tooltip card — never translucent over dense series. */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = '',
  labelFormatter,
}: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-menu rounded-[10px] px-3 py-2.5 min-w-[136px]">
      <p className="label-technical mb-1.5">
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-[2px] shrink-0"
              style={{ backgroundColor: entry.color ?? entry.stroke ?? entry.fill }}
            />
            <span className="text-[11.5px] text-ink-2">{entry.name}</span>
          </span>
          <span className="data-technical text-[12px] font-medium text-ink">
            {typeof entry.value === 'number' ? entry.value.toFixed(entry.value % 1 === 0 ? 0 : 2) : entry.value}
            <span className="text-ink-4 ml-0.5">{entry.unit ?? unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Legend row shared by charts and the cell map. */
export function LegendSwatches({
  items,
  className = '',
}: {
  items: { color: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${className}`}>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-[3px] shrink-0 border border-white/10"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[11px] text-ink-3 font-medium">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
