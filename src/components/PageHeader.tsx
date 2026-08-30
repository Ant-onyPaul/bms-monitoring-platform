import React from 'react';
import { IconArrowLeft } from './icons';

/* -----------------------------------------------------------------------------
   PageHeader

   One header treatment for every list and dashboard view. Title sizes are held
   deliberately modest — a 30px page title next to 22px telemetry values would
   make the chrome shout over the data, which is the wrong hierarchy for a
   monitoring tool.
   -------------------------------------------------------------------------- */

export interface PageHeaderProps {
  /** Small caps eyebrow above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned controls: primary action, filters, selectors. */
  actions?: React.ReactNode;
  /** Rendered beneath the title block, e.g. a metadata strip. */
  children?: React.ReactNode;
  /** Shows a back affordance above the eyebrow. */
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  onBack,
  backLabel = 'Back',
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`mb-6 ${className}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 mb-3 -ml-1 px-1 py-1 rounded
            label-technical hover:text-ink transition-colors cursor-pointer
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <IconArrowLeft
            size={12}
            className="transition-transform duration-150 group-hover:-translate-x-0.5"
          />
          {backLabel}
        </button>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="label-technical mb-2">{eyebrow}</p>}
          <h1 className="text-[24px] leading-tight font-semibold text-ink tracking-[-0.02em]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-[13.5px] text-ink-3 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>
        )}
      </div>
      {children}
    </header>
  );
}
