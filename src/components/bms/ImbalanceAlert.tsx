import { IconImbalance } from '../icons';

interface ImbalanceAlertProps {
  deltaV: number;
}

/**
 * ImbalanceAlert
 *
 * Flags the module carrying the widest cell-voltage spread in the selected
 * rack. Shown inline on the module card rather than as a floating badge,
 * because the number it reports (ΔV) belongs beside the module's own voltage.
 */
export default function ImbalanceAlert({ deltaV }: ImbalanceAlertProps) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-warn-surface border border-warn-line">
      <IconImbalance size={14} className="text-warn-ink shrink-0" />
      <span className="text-[11.5px] font-medium text-warn-ink leading-tight">
        Widest spread in rack
      </span>
      <span className="data-technical text-[12px] font-semibold text-warn-ink ml-auto">
        Δ{deltaV.toFixed(2)}
        <span className="text-warn-ink/70 ml-0.5">V</span>
      </span>
    </div>
  );
}
