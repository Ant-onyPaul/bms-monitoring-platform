import React from 'react';
import { Panel } from './ui/Panel';
import { Readout } from './ui/Metric';

/* -----------------------------------------------------------------------------
   MetricStrip

   Several related figures sharing one surface, divided by hairlines. This is
   the product's default for summary numbers: it groups values that belong to
   the same subject, costs a quarter of the vertical space of a card row, and
   keeps the page from reading as a template.
   -------------------------------------------------------------------------- */

export interface MetricItem {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  tone?: 'default' | 'ok' | 'warn' | 'crit' | 'info';
  hint?: React.ReactNode;
}

export interface MetricStripProps {
  items: MetricItem[];
  /** Columns at the largest breakpoint. Defaults to one per item. */
  columns?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const COLUMN_CLASS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

export default function MetricStrip({
  items,
  columns,
  size = 'md',
  className = '',
}: MetricStripProps) {
  const count = columns ?? items.length;
  const gridClass = COLUMN_CLASS[count] ?? 'grid-cols-2 lg:grid-cols-4';

  return (
    <Panel flush className={`overflow-hidden ${className}`}>
      {/* gap-px over a line-coloured ground draws hairlines between cells in
          every direction, so the rule stays correct as the grid re-wraps. */}
      <div className={`grid ${gridClass} gap-px bg-line`}>
        {items.map((item) => (
          <div key={item.label} className="bg-surface px-5 py-4">
            <Readout
              label={item.label}
              value={item.value}
              unit={item.unit}
              icon={item.icon}
              tone={item.tone}
              hint={item.hint}
              size={size}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}
