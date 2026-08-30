import React from 'react';

/* -----------------------------------------------------------------------------
   Panel

   The one surface primitive. Bento layouts are built by varying a panel's
   *span and density*, not by inventing new card styles — so a 4-column hero
   panel and a compact telemetry tile still read as the same material.

   `tone` tints the whole panel for status escalation. Use it sparingly: a
   tinted panel is a claim that something needs attention.
   -------------------------------------------------------------------------- */

export type PanelTone = 'default' | 'ok' | 'warn' | 'crit' | 'info';

const TONES: Record<PanelTone, string> = {
  default: 'bg-surface border-line',
  ok: 'bg-ok-surface border-ok-line',
  warn: 'bg-warn-surface border-warn-line',
  crit: 'bg-crit-surface border-crit-line',
  info: 'bg-info-surface border-info-line',
};

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PanelTone;
  interactive?: boolean;
  /** Removes internal padding so the panel can host an edge-to-edge table. */
  flush?: boolean;
  as?: 'div' | 'section' | 'article' | 'aside';
}

export function Panel({
  tone = 'default',
  interactive = false,
  flush = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: PanelProps) {
  return (
    <Tag
      className={`
        relative border rounded-[10px] shadow-[var(--shadow-e1)]
        ${TONES[tone]}
        ${flush ? '' : 'p-5'}
        ${
          interactive
            ? 'transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-precise)] hover:border-line-3 hover:shadow-[var(--shadow-e2)] cursor-pointer'
            : ''
        }
        ${className}
      `}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* -----------------------------------------------------------------------------
   PanelHeader — a label row, optionally with an icon and trailing controls.
   The icon is inline with the label at text scale, never in a coloured chip.
   -------------------------------------------------------------------------- */

export interface PanelHeaderProps {
  title: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  /** Sub-label rendered to the right of the title in muted mono. */
  meta?: React.ReactNode;
  /** Controls pinned to the trailing edge. */
  actions?: React.ReactNode;
  /** Draws a hairline beneath the header. */
  divided?: boolean;
  className?: string;
}

export function PanelHeader({
  title,
  icon: Icon,
  meta,
  actions,
  divided = false,
  className = '',
}: PanelHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        divided ? 'pb-3 mb-4 border-b border-line' : 'mb-4'
      } ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon size={13} className="text-ink-4 shrink-0" />}
        <h3 className="label-technical truncate">{title}</h3>
        {meta && <span className="label-technical text-ink-4 shrink-0">{meta}</span>}
      </div>
      {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
    </div>
  );
}

export default Panel;
