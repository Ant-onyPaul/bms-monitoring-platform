import type { ReactNode } from 'react';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { IconClose, IconWarning } from '../icons';

/* -----------------------------------------------------------------------------
   DemoDataNotice

   Shown above any view rendered from the demo source, and DemoFrame draws a
   dashed amber boundary around the view itself — so a simulated figure is
   never on screen without a marker, however far the page is scrolled.
   -------------------------------------------------------------------------- */

export function DemoDataNotice({ deviceName, onExit }: { deviceName?: string; onExit: () => void }) {
  return (
    <div
      role="status"
      className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3
        rounded-[10px] bg-warn-surface border border-warn-line shadow-[var(--shadow-e1)]"
    >
      <span className="flex items-start gap-3 flex-1 min-w-0">
        <IconWarning size={16} className="text-warn-ink shrink-0 mt-0.5" />
        <span className="min-w-0">
          <span className="flex items-center gap-2 mb-0.5">
            <Badge tone="warn" size="xs">SIMULATED</Badge>
            <span className="text-[13px] font-semibold text-warn-ink">Layout preview with demo data</span>
          </span>
          <span className="block text-[12px] text-warn-ink/90 leading-relaxed">
            Every value below is generated in the browser to show the intended layout. None of it was
            reported by {deviceName ?? 'this device'}.
          </span>
        </span>
      </span>
      <Button size="sm" variant="secondary" icon={IconClose} onClick={onExit} className="shrink-0">
        Exit preview
      </Button>
    </div>
  );
}

/** Boundary around a simulated view. */
export function DemoFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-[16px] border-2 border-dashed border-warn-line p-3 sm:p-4">
      <span
        aria-hidden="true"
        className="absolute -top-2.5 right-5 px-1.5 bg-canvas label-technical !text-[9.5px] !text-warn-ink"
      >
        Simulated
      </span>
      {children}
    </div>
  );
}

export default DemoDataNotice;
