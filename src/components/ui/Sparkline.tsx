import React, { useId } from 'react';

/* -----------------------------------------------------------------------------
   Sparkline

   An axis-free trend shown *beside the number it belongs to*, so a value always
   carries its recent direction. Deliberately unlabelled — when a reader needs
   exact points they open History; this only answers "which way is it going".
   -------------------------------------------------------------------------- */

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  tone?: 'ok' | 'warn' | 'crit' | 'info' | 'neutral';
  /** Fills the area beneath the line with a soft gradient. */
  area?: boolean;
  /** Marks the final sample with a dot. */
  showLast?: boolean;
  strokeWidth?: number;
  className?: string;
}

const COLOR = {
  ok: 'var(--color-ok)',
  warn: 'var(--color-warn)',
  crit: 'var(--color-crit)',
  info: 'var(--color-info)',
  neutral: 'var(--color-ink-4)',
};

export default function Sparkline({
  data,
  width = 96,
  height = 28,
  tone = 'neutral',
  area = false,
  showLast = false,
  strokeWidth = 1.5,
  className = '',
}: SparklineProps) {
  const gradientId = useId();

  if (!data || data.length < 2) {
    return <div style={{ width, height }} className={className} aria-hidden="true" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = strokeWidth;

  const points = data.map((value, index) => {
    const x = pad + (index / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (value - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const fill = `${line} L${points[points.length - 1][0].toFixed(2)},${height} L${points[0][0].toFixed(2)},${height} Z`;
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      {area && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR[tone]} stopOpacity="0.18" />
              <stop offset="100%" stopColor={COLOR[tone]} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fill} fill={`url(#${gradientId})`} />
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke={COLOR[tone]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showLast && <circle cx={lastX} cy={lastY} r={strokeWidth + 0.8} fill={COLOR[tone]} />}
    </svg>
  );
}
