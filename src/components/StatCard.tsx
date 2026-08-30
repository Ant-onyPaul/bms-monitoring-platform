import React from 'react';
import { Panel } from './ui/Panel';
import { Readout } from './ui/Metric';
import Sparkline from './ui/Sparkline';

/* -----------------------------------------------------------------------------
   StatCard

   A single figure that genuinely deserves its own surface. Where several
   figures belong together, use MetricStrip instead — a row of identical stat
   cards is the fastest way to make a product look generic, and it wastes the
   hierarchy that a real difference in importance could carry.

   The icon sits inline at label scale rather than inside a coloured tile.
   -------------------------------------------------------------------------- */

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  unit?: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  tone?: 'default' | 'ok' | 'warn' | 'crit' | 'info';
  /** Context line under the value. */
  hint?: React.ReactNode;
  /** Recent history rendered as an inline trend. */
  trend?: number[];
  /** Legacy prop from the previous design system; ignored. */
  colorClass?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  unit,
  icon,
  tone = 'default',
  hint,
  trend,
  className = '',
}: StatCardProps) {
  const sparkTone = tone === 'default' ? 'neutral' : tone;

  return (
    <Panel className={`flex items-end justify-between gap-4 ${className}`}>
      <Readout label={title} value={value} unit={unit} icon={icon} tone={tone} hint={hint} />
      {trend && trend.length > 1 && (
        <Sparkline data={trend} tone={sparkTone as any} area showLast className="shrink-0 mb-1" />
      )}
    </Panel>
  );
}
