import React from 'react';

/* -----------------------------------------------------------------------------
   Readout & Meter

   The telemetry primitives. A Readout is deliberately *not* a card — it renders
   as bare content so several can share one panel separated by hairlines. That
   is what keeps the product from collapsing into an endless grid of identical
   KPI boxes: cards are for groups of related instruments, readouts are for the
   individual values inside them.
   -------------------------------------------------------------------------- */

export interface ReadoutProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** Optional inline icon, at label scale, never in a coloured chip. */
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  /** Secondary line beneath the value — range, timestamp, or context. */
  hint?: React.ReactNode;
  /** Colour escalation for the value itself. */
  tone?: 'default' | 'ok' | 'warn' | 'crit' | 'info';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  className?: string;
}

const VALUE_TONE = {
  default: 'text-ink',
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  crit: 'text-crit-ink',
  info: 'text-info-ink',
};

const VALUE_SIZE = {
  sm: 'text-[17px]',
  md: 'text-[22px]',
  lg: 'text-[30px]',
};

const UNIT_SIZE = {
  sm: 'text-[11px]',
  md: 'text-[12px]',
  lg: 'text-[14px]',
};

export function Readout({
  label,
  value,
  unit,
  icon: Icon,
  hint,
  tone = 'default',
  size = 'md',
  align = 'left',
  className = '',
}: ReadoutProps) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'text-right' : ''} ${className}`}>
      <div
        className={`flex items-center gap-1.5 mb-1.5 ${
          align === 'right' ? 'justify-end' : ''
        }`}
      >
        {Icon && <Icon size={12} className="text-ink-4 shrink-0" />}
        <span className="label-technical truncate">{label}</span>
      </div>

      <div className={`flex items-baseline gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        <span
          className={`data-technical font-medium leading-none ${VALUE_SIZE[size]} ${VALUE_TONE[tone]}`}
        >
          {value}
        </span>
        {unit && (
          <span className={`font-medium text-ink-4 leading-none ${UNIT_SIZE[size]}`}>{unit}</span>
        )}
      </div>

      {hint && <div className="mt-1.5 text-[11px] text-ink-3 leading-tight">{hint}</div>}
    </div>
  );
}

/* -----------------------------------------------------------------------------
   Meter — a value positioned inside its operating range.

   Shows *where a reading sits between its limits*, which a bare number cannot.
   The nominal band is drawn as a lighter interior region so an in-spec value is
   readable at a glance without reading the digits.
   -------------------------------------------------------------------------- */

export interface MeterProps {
  value: number;
  min: number;
  max: number;
  /**
   * Start of the fill. Defaults to `min`, which reads as "how far up the scale
   * is this". Set it to draw a *band* instead — a spread between two readings,
   * where the width itself is the quantity of interest.
   */
  from?: number;
  /** Optional in-spec sub-range drawn behind the fill, e.g. a nominal window. */
  nominal?: [number, number];
  tone?: 'ok' | 'warn' | 'crit' | 'info' | 'neutral';
  /** Height of the track in px. */
  height?: number;
  showTicks?: boolean;
  className?: string;
  label?: string;
}

const FILL = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  crit: 'bg-crit',
  info: 'bg-info',
  neutral: 'bg-ink-4',
};

export function Meter({
  value,
  min,
  max,
  from,
  nominal,
  tone = 'ok',
  height = 4,
  showTicks = false,
  className = '',
  label,
}: MeterProps) {
  const span = max - min || 1;
  const clamp = (n: number) => Math.min(100, Math.max(0, ((n - min) / span) * 100));

  const start = clamp(typeof from === 'number' ? from : min);
  const end = clamp(value);
  // A band narrower than 1.5% would vanish; keep it visible as a marker.
  const width = Math.max(end - start, from !== undefined ? 1.5 : 0);

  return (
    <div className={className}>
      <div
        className="relative w-full rounded-full bg-surface-3 overflow-hidden"
        style={{ height }}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
      >
        {nominal && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 bg-line"
            style={{
              left: `${clamp(nominal[0])}%`,
              width: `${clamp(nominal[1]) - clamp(nominal[0])}%`,
            }}
          />
        )}
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 rounded-full ${FILL[tone]}`}
          style={{
            left: `${start}%`,
            width: `${width}%`,
            transition:
              'left 620ms var(--ease-precise), width 620ms var(--ease-precise), background-color 200ms linear',
          }}
        />
      </div>

      {showTicks && (
        <div className="flex justify-between mt-1.5">
          <span className="data-technical text-[10px] text-ink-4">{min}</span>
          <span className="data-technical text-[10px] text-ink-4">{max}</span>
        </div>
      )}
    </div>
  );
}

export default Readout;
