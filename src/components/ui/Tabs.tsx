import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

/* -----------------------------------------------------------------------------
   Tabs

   A single indicator element slides between tabs rather than each tab drawing
   its own border, so switching reads as one continuous movement. The indicator
   is measured from the live DOM, which keeps it correct when labels are
   localised or a count badge changes width.
   -------------------------------------------------------------------------- */

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  /** Optional trailing count; a non-zero value in `tone` escalates its colour. */
  count?: number;
  tone?: 'default' | 'warn' | 'crit';
}

export interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className = '',
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  /* Callers commonly build the tab array inline, so it is a new reference on
     every render. Key the effect on the ids instead, or the ResizeObserver is
     torn down and rebuilt each pass — which re-measures, sets state, and
     re-renders forever. */
  const tabKey = useMemo(() => tabs.map((t) => t.id).join('|'), [tabs]);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-tab-id="${active}"]`);
    if (!el) return;

    const left = el.offsetLeft;
    const width = el.offsetWidth;
    // Bail out when nothing moved, so an observer callback cannot re-enter.
    setIndicator((current) =>
      current.left === left && current.width === width && current.ready
        ? current
        : { left, width, ready: true },
    );
  }, [active]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    measure();

    // Labels shift on resize and on webfont swap; keep the rail aligned.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure, tabKey]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const index = tabs.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(tabs[(index + 1) % tabs.length].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(tabs[(index - 1 + tabs.length) % tabs.length].id);
    }
  };

  return (
    <div className={`relative border-b border-line ${className}`}>
      <div
        ref={listRef}
        role="tablist"
        onKeyDown={onKeyDown}
        className="relative flex items-center gap-1 overflow-x-auto scrollbar-fine -mb-px"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={`
                relative shrink-0 h-11 px-3.5 inline-flex items-center gap-2
                text-[13px] font-medium whitespace-nowrap cursor-pointer
                transition-colors duration-150 [transition-timing-function:var(--ease-precise)]
                focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand
                ${isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'}
              `}
            >
              {Icon && (
                <Icon
                  size={14}
                  className={`shrink-0 transition-colors duration-150 ${
                    isActive ? 'text-brand-ink' : 'text-ink-4'
                  }`}
                />
              )}
              {tab.label}
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`
                    data-technical text-[10px] leading-none px-1.5 py-1 rounded-[4px] border
                    ${
                      tab.tone === 'crit'
                        ? 'bg-crit-surface text-crit-ink border-crit-line'
                        : tab.tone === 'warn'
                          ? 'bg-warn-surface text-warn-ink border-warn-line'
                          : 'bg-surface-3 text-ink-3 border-line'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Sliding active rail */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 h-[2px] bg-brand-ink rounded-full"
          style={{
            left: indicator.left,
            width: indicator.width,
            opacity: indicator.ready ? 1 : 0,
            transition:
              'left 280ms var(--ease-precise), width 280ms var(--ease-precise), opacity 160ms linear',
          }}
        />
      </div>
    </div>
  );
}
