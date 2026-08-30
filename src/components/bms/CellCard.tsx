import Tooltip from '../ui/Tooltip';
import { IconArrowUp, IconArrowDown, IconBalancing } from '../icons';

export interface BmsCell {
  id: string;
  name: string;
  voltage: number;
  health: string;
  balancing: boolean;
}

interface CellCardProps {
  cell: BmsCell;
  highlightType: 'highest' | 'lowest' | null;
  /** 0-1 position of this cell's voltage within the module's spread. */
  intensity?: number;
  index?: number;
}

/* -----------------------------------------------------------------------------
   CellCard

   One tile in the voltage map. At 52 cells per module the tile has to survive
   at roughly 68px wide, so it carries exactly three things: the cell number,
   the millivolt reading, and a saturation band encoding where that reading sits
   in the module's spread.

   Saturation — not hue — carries the magnitude. Hue is reserved for state
   (amber = out of spec, blue = balancing), which keeps a normal module reading
   as a calm green gradient with any anomaly jumping out immediately.
   -------------------------------------------------------------------------- */

export default function CellCard({ cell, highlightType, intensity = 0.5, index }: CellCardProps) {
  const isHighest = highlightType === 'highest';
  const isLowest = highlightType === 'lowest';
  const isAbnormal = cell.health.toLowerCase() !== 'healthy';

  // Saturation band: 8% at the bottom of the spread, 34% at the top.
  const wash = 0.08 + Math.min(1, Math.max(0, intensity)) * 0.26;

  let borderClass = 'border-line';
  let background = `rgba(16, 185, 129, ${wash})`;
  let valueClass = 'text-ink';

  if (isAbnormal) {
    borderClass = 'border-warn-line';
    background = 'var(--color-warn-surface)';
    valueClass = 'text-warn-ink';
  }
  if (isLowest) {
    borderClass = 'border-warn';
    valueClass = 'text-warn-ink';
  }
  if (isHighest) {
    borderClass = 'border-ok';
    valueClass = 'text-ok-ink';
  }

  const tooltip = (
    <span className="flex flex-col gap-0.5 text-left">
      <span className="font-semibold">{cell.name}</span>
      <span className="opacity-80">{cell.voltage} mV · {cell.health}</span>
      <span className="opacity-80">{cell.balancing ? 'Balancing active' : 'Balancing idle'}</span>
    </span>
  );

  return (
    <Tooltip content={tooltip} delay={140}>
      <div
        className={`
          relative w-full flex flex-col justify-between rounded-[6px] border p-2
          transition-[border-color,transform,box-shadow] duration-150
          [transition-timing-function:var(--ease-precise)]
          hover:border-line-3 hover:shadow-[var(--shadow-e2)] hover:z-10
          cursor-default select-none
          ${borderClass}
        `}
        style={{ backgroundColor: background }}
      >
        {/* Index & state markers */}
        <div className="flex items-start justify-between gap-1">
          <span className="data-technical text-[9.5px] font-medium text-ink-3 leading-none">
            {typeof index === 'number' ? String(index + 1).padStart(2, '0') : cell.name}
          </span>
          <span className="flex items-center gap-0.5 shrink-0">
            {cell.balancing && <IconBalancing size={9} className="text-info" />}
            {isHighest && <IconArrowUp size={9} className="text-ok-ink" />}
            {isLowest && <IconArrowDown size={9} className="text-warn-ink" />}
          </span>
        </div>

        {/* Reading */}
        <div className="mt-2">
          <span className={`data-technical text-[13px] font-medium leading-none ${valueClass}`}>
            {cell.voltage}
          </span>
          <span className="text-[8.5px] text-ink-4 ml-0.5">mV</span>
        </div>
      </div>
    </Tooltip>
  );
}
