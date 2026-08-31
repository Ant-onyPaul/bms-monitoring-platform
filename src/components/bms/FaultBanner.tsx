import { BmsFault } from '../../types/bms.types';
import { IconFault, IconWarning, IconCheckCircle } from '../icons';

/* =============================================================================
   Fault presentation

   The company's rule: never show a bare "FAULT". These components take a
   `BmsFault`, whose type makes `name` mandatory, so a nameless fault cannot
   reach the screen. The severity word and the fault name are always rendered
   together, with the code and origin alongside.
   ========================================================================== */

const SEVERITY = {
  fault: {
    label: 'Fault',
    icon: IconFault,
    panel: 'bg-crit-surface border-crit-line',
    ink: 'text-crit-ink',
    accent: 'text-crit',
    spine: 'bg-crit',
  },
  warning: {
    label: 'Warning',
    icon: IconWarning,
    panel: 'bg-warn-surface border-warn-line',
    ink: 'text-warn-ink',
    accent: 'text-warn',
    spine: 'bg-warn',
  },
} as const;

/* -----------------------------------------------------------------------------
   Banner — full-width, for the top of the device workspace.
   -------------------------------------------------------------------------- */

export function FaultBanner({
  fault,
  className = '',
}: {
  fault: BmsFault | null;
  className?: string;
}) {
  if (!fault) return null;

  const severity = SEVERITY[fault.severity];
  const Icon = severity.icon;

  return (
    <div
      role="status"
      className={`relative overflow-hidden rounded-[10px] border ${severity.panel} ${className}`}
    >
      <span aria-hidden="true" className={`absolute left-0 inset-y-0 w-[3px] ${severity.spine}`} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 pl-5 pr-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <Icon size={18} className={`${severity.accent} shrink-0`} />
          <div className="min-w-0">
            {/* Severity word and fault name, never one without the other. */}
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span
                className={`label-technical !text-[10px] ${severity.ink}`}
              >
                {severity.label}
              </span>
              <span className={`text-[14px] font-semibold ${severity.ink}`}>{fault.name}</span>
            </p>
            {fault.detail && (
              <p className="mt-1 text-[12.5px] text-ink-2 leading-relaxed">{fault.detail}</p>
            )}
          </div>
        </div>

        <dl className="flex items-center gap-5 sm:ml-auto shrink-0 pl-8 sm:pl-0">
          <div>
            <dt className="label-technical mb-0.5">Code</dt>
            <dd className="data-technical text-[12px] text-ink-2">{fault.code}</dd>
          </div>
          <div>
            <dt className="label-technical mb-0.5">Origin</dt>
            <dd className="data-technical text-[12px] text-ink-2">{fault.source}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   Inline — compact form for rack rows and summary strips.

   Renders the healthy case too, so a caller can drop it in a fixed slot without
   the layout shifting when a fault clears.
   -------------------------------------------------------------------------- */

export function FaultInline({
  fault,
  healthyLabel = 'No active fault',
  className = '',
}: {
  fault: BmsFault | null;
  healthyLabel?: string;
  className?: string;
}) {
  if (!fault) {
    return (
      <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
        <IconCheckCircle size={13} className="text-ok shrink-0" />
        <span className="text-[12.5px] text-ink-3 truncate">{healthyLabel}</span>
      </span>
    );
  }

  const severity = SEVERITY[fault.severity];
  const Icon = severity.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      <Icon size={13} className={`${severity.accent} shrink-0`} />
      <span className={`text-[12.5px] font-medium ${severity.ink} truncate`}>
        {severity.label} · {fault.name}
      </span>
      <span className="data-technical text-[11px] text-ink-4 shrink-0">{fault.code}</span>
    </span>
  );
}
