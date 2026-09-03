import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { IconChevronDown, IconCheck } from '../icons';

/* -----------------------------------------------------------------------------
   Select — the system's single dropdown.

   Built as a real listbox: roving focus, Home/End, Escape, click-outside, and
   `aria-activedescendant` so screen readers track the highlighted option.

   The menu is the *least* transparent glass tier in the system (93%) at
   z-index 60, because it routinely opens over dense cell and module grids. The
   blur is there for depth; the opacity is there so voltage digits never bleed
   through an option label.
   -------------------------------------------------------------------------- */

export interface SelectOption {
  id: string;
  name: string;
  /** Optional trailing detail, e.g. "12 modules" or a status word. */
  meta?: string;
  disabled?: boolean;
}

export interface SelectProps<T extends SelectOption> {
  options: T[];
  value: T;
  onChange: (option: T) => void;
  /** Small caps label rendered above the trigger. */
  label?: string;
  /** Leading icon inside the trigger. */
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  widthClass?: string;
  align?: 'left' | 'right';
  className?: string;
}

export default function Select<T extends SelectOption>({
  options,
  value,
  onChange,
  label,
  icon: Icon,
  widthClass = 'w-56',
  align = 'left',
  className = '',
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.id === value.id)),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  /* Dismiss on outside pointer-down and on Escape, wherever focus sits. */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  /* Sync the highlight to the selection each time the menu opens. */
  useEffect(() => {
    if (open) {
      const i = options.findIndex((o) => o.id === value.id);
      setActiveIndex(i >= 0 ? i : 0);
      requestAnimationFrame(() => listRef.current?.focus());
    }
  }, [open, options, value.id]);

  const step = (dir: 1 | -1) => {
    setActiveIndex((current) => {
      const total = options.length;
      let next = current;
      for (let i = 0; i < total; i += 1) {
        next = (next + dir + total) % total;
        if (!options[next]?.disabled) return next;
      }
      return current;
    });
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option);
    close();
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        step(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        step(-1);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(activeIndex);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && <span className="label-technical block mb-1.5">{label}</span>}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={`
          ${widthClass} h-[38px] inline-flex items-center justify-between gap-2
          px-3 rounded-[9px] glass-control text-[13px] font-medium text-ink
          cursor-pointer select-none
          transition-[border-color,box-shadow,background-color] duration-200
          [transition-timing-function:var(--ease-precise)]
          hover:bg-veil-3
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
          ${open ? '!border-line-3 bg-veil-3' : ''}
        `}
      >
        <span className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={14} className="text-ink-4 shrink-0" />}
          <span className="truncate">{value.name}</span>
        </span>
        <IconChevronDown
          size={14}
          className={`text-ink-4 shrink-0 transition-transform duration-200 [transition-timing-function:var(--ease-precise)] ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listboxId}-${activeIndex}`}
          onKeyDown={onListKeyDown}
          className={`
            absolute z-[60] mt-2 ${widthClass} max-h-72 overflow-y-auto scrollbar-fine
            glass-menu rounded-[11px]
            py-1.5 outline-none animate-menu-in
            ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
          `}
        >
          {options.map((option, index) => {
            const selected = option.id === value.id;
            const active = index === activeIndex;
            return (
              <li
                key={option.id}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={selected}
                aria-disabled={option.disabled || undefined}
                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                onClick={() => commit(index)}
                className={`
                  mx-1.5 px-2.5 h-[34px] flex items-center justify-between gap-3 rounded-[7px]
                  text-[13px] cursor-pointer select-none
                  transition-colors duration-100
                  ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                  ${active && !option.disabled ? 'bg-veil-3' : ''}
                  ${selected ? 'text-brand-ink font-semibold' : 'text-ink-2'}
                `}
              >
                <span className="truncate">{option.name}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {option.meta && (
                    <span className="data-technical text-[11px] text-ink-4">{option.meta}</span>
                  )}
                  {selected && <IconCheck size={13} className="text-brand-ink" />}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
