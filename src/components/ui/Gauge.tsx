import React, { useEffect, useState } from 'react';

/* -----------------------------------------------------------------------------
   Gauge — a 270° instrument arc.

   The arc animates from zero to its value once on mount, which reads as an
   instrument taking a measurement rather than as decoration. Everything is
   drawn from one stroke-dash calculation so the sweep, the track and the
   threshold tick always agree.
   -------------------------------------------------------------------------- */

export interface GaugeProps {
  /** 0-100. */
  value: number;
  label: string;
  unit?: string;
  size?: number;
  thickness?: number;
  tone?: 'ok' | 'warn' | 'crit' | 'info' | 'brand';
  /** Draws a tick at this percentage, e.g. a low-charge threshold. */
  threshold?: number;
  /** Secondary line under the value. */
  caption?: React.ReactNode;
  className?: string;
}

const STROKE = {
  ok: 'var(--color-ok)',
  warn: 'var(--color-warn)',
  crit: 'var(--color-crit)',
  info: 'var(--color-info)',
  brand: 'var(--color-brand)',
};

export default function Gauge({
  value,
  label,
  unit = '%',
  size = 132,
  thickness = 8,
  tone = 'brand',
  threshold,
  caption,
  className = '',
}: GaugeProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    // Defer one frame so the browser paints the zero state before easing to value.
    const raf = requestAnimationFrame(() => setAnimated(value));
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  // 270° of travel, rotated so the gap sits at the bottom.
  const sweep = 0.75;
  const arcLength = circumference * sweep;
  const progress = Math.min(100, Math.max(0, animated)) / 100;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[135deg]" aria-hidden="true">
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--color-surface-3)"
            strokeWidth={thickness}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Value */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={STROKE[tone]}
            strokeWidth={thickness}
            strokeDasharray={`${arcLength * progress} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 900ms var(--ease-precise)' }}
          />
          {/* Threshold tick */}
          {typeof threshold === 'number' && (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--color-ink-4)"
              strokeWidth={thickness + 3}
              strokeDasharray={`1.5 ${circumference}`}
              strokeDashoffset={-arcLength * (threshold / 100)}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <span className="data-technical text-[26px] font-medium text-ink leading-none">
              {Math.round(value)}
            </span>
            <span className="text-[12px] font-medium text-ink-4">{unit}</span>
          </div>
          <span className="label-technical mt-1.5">{label}</span>
        </div>
      </div>

      {caption && <div className="mt-2 text-[11px] text-ink-3 text-center">{caption}</div>}
    </div>
  );
}
