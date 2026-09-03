import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from '../icons';

/* -----------------------------------------------------------------------------
   Modal

   The scrim darkens and lightly blurs the room behind the dialog; the dialog
   itself is the deepest glass tier, so it reads as a lit pane floating above
   the console. Focus is trapped, Escape closes, body scroll is locked.
   -------------------------------------------------------------------------- */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width class for the dialog. */
  widthClass?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  widthClass = 'max-w-lg',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  /* Call sites pass an inline arrow for onClose, so holding it in a ref keeps
     the setup effect keyed on `isOpen` alone — otherwise the cleanup would
     restore focus on every parent render. */
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog on the next frame, after the entrance starts.
    const raf = requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? dialogRef.current)?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /* Rendered into <body>, not in place.

     The route content in DashboardLayout carries an entrance animation with
     `fill-mode: both`, so its final `translateY(0)` sticks around permanently —
     and a non-`none` transform makes that element the containing block for any
     `position: fixed` descendant. Left in the tree, this overlay would size and
     centre itself against the full scroll height of the page rather than the
     viewport, pushing tall dialogs off the bottom of the screen. A portal takes
     the overlay out of that subtree so `fixed` means fixed. */
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-[6px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={`
          relative w-full ${widthClass} max-h-[calc(100vh-3rem)]
          glass-modal rounded-[18px]
          flex flex-col overflow-hidden animate-modal-in outline-none
        `}
      >
        <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-line">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-[16px] font-semibold text-ink tracking-[-0.01em]">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-[13px] text-ink-3 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 -mr-1.5 -mt-0.5 w-8 h-8 inline-flex items-center justify-center rounded-[8px]
              text-ink-3 hover:text-ink hover:bg-veil-3 cursor-pointer
              transition-colors duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <IconClose size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-fine px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-line bg-veil-1">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
