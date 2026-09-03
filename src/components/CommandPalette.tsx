import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  IconSearch,
  IconDashboard,
  IconVendors,
  IconCustomers,
  IconRack,
  IconDevice,
  IconChevronRight,
} from './icons';

/* -----------------------------------------------------------------------------
   Command palette (⌘K / Ctrl-K)

   A faster route to pages that already exist — it navigates, and does nothing
   else. No destination here is reachable only through the palette, so the
   product's flow is unchanged whether or not anyone ever opens it.
   -------------------------------------------------------------------------- */

interface Command {
  id: string;
  label: string;
  group: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  path: string;
}

const ROUTES: Record<string, Command[]> = {
  admin: [
    { id: 'a-dash', label: 'Dashboard', group: 'Navigate', icon: IconDashboard, path: '/admin/dashboard' },
    { id: 'a-vend', label: 'Vendors', group: 'Navigate', icon: IconVendors, path: '/admin/vendors' },
    { id: 'a-cust', label: 'Customers', group: 'Navigate', icon: IconCustomers, path: '/admin/customers' },
    { id: 'a-dev', label: 'Devices', group: 'Navigate', icon: IconRack, path: '/admin/devices' },
    { id: 'a-d1', label: 'Main HQ Battery', group: 'Devices', hint: 'BMS-A001 · New York', icon: IconDevice, path: '/admin/devices/1' },
    { id: 'a-d2', label: 'Branch 1 Backup', group: 'Devices', hint: 'BMS-A002 · Boston', icon: IconDevice, path: '/admin/devices/2' },
  ],
  vendor: [
    { id: 'v-dash', label: 'Dashboard', group: 'Navigate', icon: IconDashboard, path: '/vendor/dashboard' },
    { id: 'v-cust', label: 'Customers', group: 'Navigate', icon: IconCustomers, path: '/vendor/customers' },
    { id: 'v-dev', label: 'Devices', group: 'Navigate', icon: IconRack, path: '/vendor/devices' },
    { id: 'v-d1', label: 'Main HQ Battery', group: 'Devices', hint: 'BMS-A001 · New York', icon: IconDevice, path: '/vendor/devices/1' },
  ],
  customer: [
    { id: 'c-dash', label: 'Dashboard', group: 'Navigate', icon: IconDashboard, path: '/customer/dashboard' },
    { id: 'c-dev', label: 'My Devices', group: 'Navigate', icon: IconRack, path: '/customer/devices' },
    { id: 'c-d1', label: 'Main HQ Battery', group: 'Devices', hint: 'BMS-A001 · New York', icon: IconDevice, path: '/customer/devices/1' },
  ],
};

export default function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = ROUTES[profile?.role || 'customer'] ?? ROUTES.customer;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.hint?.toLowerCase().includes(q),
    );
  }, [query, commands]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Keep the highlighted row inside the scroll viewport during arrow travel.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  const run = (command?: Command) => {
    if (!command) return;
    onClose();
    navigate(command.path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  let renderedGroup = '';

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-[6px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-[580px] glass-modal rounded-[18px]
          overflow-hidden animate-modal-in"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 px-4 h-13 border-b border-line">
          <IconSearch size={16} className="text-ink-4 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and devices…"
            aria-label="Search pages and devices"
            className="flex-1 h-12 bg-transparent border-0 outline-none text-[14px] text-ink
              placeholder:text-ink-4"
          />
          <kbd
            className="shrink-0 data-technical text-[10px] text-ink-4 border border-line
              rounded-[5px] px-1.5 py-1 bg-veil-2"
          >
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto scrollbar-fine py-2">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-ink-3">
              No matches for “{query}”.
            </p>
          ) : (
            results.map((command, index) => {
              const Icon = command.icon;
              const showGroup = command.group !== renderedGroup;
              renderedGroup = command.group;
              const active = index === activeIndex;

              return (
                <div key={command.id}>
                  {showGroup && (
                    <div className="px-4 pt-3 pb-1.5">
                      <span className="label-technical">{command.group}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => run(command)}
                    className={`w-full mx-0 px-4 h-11 flex items-center gap-3 text-left cursor-pointer
                      transition-colors duration-100
                      ${active ? 'bg-veil-3' : ''}`}
                  >
                    <Icon size={15} className={active ? 'text-brand-ink' : 'text-ink-4'} />
                    <span className="flex-1 min-w-0 text-[13.5px] font-medium text-ink truncate">
                      {command.label}
                    </span>
                    {command.hint && (
                      <span className="data-technical text-[11px] text-ink-4 truncate hidden sm:block">
                        {command.hint}
                      </span>
                    )}
                    <IconChevronRight
                      size={13}
                      className={`shrink-0 ${active ? 'text-ink-3' : 'text-transparent'}`}
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-line bg-veil-1">
          <Hint keys={['↑', '↓']} label="Navigate" />
          <Hint keys={['↵']} label="Open" />
        </div>
      </div>
    </div>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {keys.map((k) => (
        <kbd
          key={k}
          className="data-technical text-[10px] text-ink-3 border border-line rounded-[4px]
            min-w-[18px] h-[18px] inline-flex items-center justify-center bg-veil-2 px-1"
        >
          {k}
        </kbd>
      ))}
      <span className="text-[11px] text-ink-4">{label}</span>
    </span>
  );
}
