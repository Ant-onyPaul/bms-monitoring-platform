import React from 'react';
import { IconChevronRight } from './icons';

/* -----------------------------------------------------------------------------
   Shared table cell renderers.

   Centralised so a device row looks the same whether an admin, a vendor or a
   customer is reading it — the three roles see different subsets of the fleet,
   never a different presentation of it.
   -------------------------------------------------------------------------- */

/** Primary identifier with its machine code beneath. */
export function NameCell({ name, code }: { name: string; code?: string | null }) {
  return (
    <span className="flex flex-col min-w-0">
      <span className="text-[13.5px] font-medium text-ink truncate">{name}</span>
      {code && (
        <span className="data-technical text-[11px] text-ink-4 mt-0.5 truncate">{code}</span>
      )}
    </span>
  );
}

/** Machine-generated value: identifiers, codes, timestamps. */
export function MonoCell({ children }: { children: React.ReactNode }) {
  return <span className="data-technical text-[12.5px] text-ink-2">{children}</span>;
}

/** Secondary attribute with a leading glyph, e.g. location. */
export function AttributeCell({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <Icon size={13} className="text-ink-4 shrink-0" />
      <span className="text-[13px] text-ink-2 truncate">{children}</span>
    </span>
  );
}

/**
 * Row action.
 *
 * Stops propagation so it works inside a clickable row, and stays visible at
 * low emphasis rather than appearing on hover — a hidden action is unreachable
 * on touch.
 */
export function RowAction({
  label,
  onClick,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className="group inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-3
        hover:text-brand-ink cursor-pointer transition-colors duration-150
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded"
    >
      {label}
      <IconChevronRight
        size={12}
        className="transition-transform duration-150 group-hover:translate-x-0.5"
      />
    </button>
  );
}

/** Compact relative time, e.g. "4m ago". Falls back to a date past a week. */
export function relativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}
