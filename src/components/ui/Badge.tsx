import React from 'react';

/* -----------------------------------------------------------------------------
   Badge & LiveDot

   Status vocabulary for the whole product. Every state in the system maps to
   exactly one of five tones, so "warning" looks identical whether it appears on
   a cell, a module, a device row or an alert.

   Badges are rectangles with a 4px radius, not pills — pills read consumer,
   rectangles read instrument.
   -------------------------------------------------------------------------- */

export type Tone = 'ok' | 'warn' | 'crit' | 'info' | 'idle' | 'neutral';

const TONES: Record<Tone, { chip: string; dot: string; text: string }> = {
  ok:      { chip: 'bg-ok-surface text-ok-ink border-ok-line',       dot: 'bg-ok',   text: 'text-ok-ink' },
  warn:    { chip: 'bg-warn-surface text-warn-ink border-warn-line', dot: 'bg-warn', text: 'text-warn-ink' },
  crit:    { chip: 'bg-crit-surface text-crit-ink border-crit-line', dot: 'bg-crit', text: 'text-crit-ink' },
  info:    { chip: 'bg-info-surface text-info-ink border-info-line', dot: 'bg-info', text: 'text-info-ink' },
  idle:    { chip: 'bg-idle-surface text-idle-ink border-idle-line', dot: 'bg-idle', text: 'text-idle-ink' },
  neutral: { chip: 'bg-surface-2 text-ink-2 border-line-2',          dot: 'bg-ink-4', text: 'text-ink-2' },
};

export interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  /** Renders a small state dot instead of an icon. */
  dot?: boolean;
  /** Slowly pulses the dot to signal a live/streaming state. */
  live?: boolean;
  size?: 'xs' | 'sm';
  className?: string;
}

export function Badge({
  tone = 'neutral',
  children,
  icon: Icon,
  dot = false,
  live = false,
  size = 'sm',
  className = '',
}: BadgeProps) {
  const t = TONES[tone];
  const dims =
    size === 'xs'
      ? 'h-5 px-1.5 text-[10px] gap-1 tracking-[0.06em]'
      : 'h-6 px-2 text-[11px] gap-1.5 tracking-[0.03em]';

  return (
    <span
      className={`inline-flex items-center rounded-[4px] border font-semibold
        whitespace-nowrap ${dims} ${t.chip} ${className}`}
    >
      {dot && (
        <span className="relative flex shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${t.dot} ${live ? 'animate-live-pulse' : ''}`} />
        </span>
      )}
      {!dot && Icon && <Icon size={size === 'xs' ? 11 : 12} className="shrink-0" />}
      {children}
    </span>
  );
}

/* -----------------------------------------------------------------------------
   LiveDot — a standalone state indicator with an optional expanding ring.
   The ring only runs for genuinely live/streaming state, never for decoration.
   -------------------------------------------------------------------------- */

export function LiveDot({
  tone = 'ok',
  live = false,
  size = 6,
  className = '',
}: {
  tone?: Tone;
  live?: boolean;
  size?: number;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {live && (
        <span
          className={`absolute inset-0 rounded-full ${t.dot} animate-live-ring`}
          aria-hidden="true"
        />
      )}
      <span className={`relative inline-flex w-full h-full rounded-full ${t.dot}`} />
    </span>
  );
}

/* Maps free-text health strings from the BMS layer onto the tone vocabulary. */
export function toneForHealth(status: string): Tone {
  switch (status?.toLowerCase()) {
    case 'healthy':
    case 'normal':
    case 'ok':
    case 'active':
    case 'connected':
      return 'ok';
    case 'warning':
      return 'warn';
    case 'fault':
    case 'critical':
      return 'crit';
    case 'offline':
    case 'inactive':
      return 'idle';
    case 'info':
      return 'info';
    default:
      return 'neutral';
  }
}

export default Badge;
