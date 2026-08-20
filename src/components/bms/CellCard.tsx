import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import HealthBadge from './HealthBadge';
import BalancingBadge from './BalancingBadge';

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
}

export default function CellCard({ cell, highlightType }: CellCardProps) {
  const isHighest = highlightType === 'highest';
  const isLowest = highlightType === 'lowest';

  let borderClass = 'border-border';
  let bgClass = 'bg-card hover:bg-muted/50';

  if (isHighest) {
    borderClass = 'border-[#10B981]/50';
    bgClass = 'bg-[#10B981]/5';
  } else if (isLowest) {
    borderClass = 'border-orange-500/50';
    bgClass = 'bg-orange-500/5';
  }

  return (
    <div 
      className={`premium-card p-3 cursor-pointer flex flex-col justify-between h-full group relative transition-all duration-200 hover:-translate-y-0.5 ${borderClass} ${bgClass}`}
    >
      {/* Header section */}
      <div className="flex justify-between items-start mb-3 border-b border-border pb-2">
        <div>
          <h3 className="label-technical text-foreground/90">{cell.name}</h3>
          {(isHighest || isLowest) && (
            <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider ${isHighest ? 'text-[#10B981]' : 'text-orange-500'}`}>
              {isHighest ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
              {isHighest ? 'High' : 'Low'}
            </div>
          )}
        </div>
        <HealthBadge status={cell.health} />
      </div>

      {/* Voltage display */}
      <div className="flex items-baseline mb-3">
        <span className={`text-2xl data-technical font-medium ${isHighest ? 'text-[#10B981]' : isLowest ? 'text-orange-500' : 'text-foreground'}`}>
          {cell.voltage}
        </span>
        <span className="ml-1 text-xs text-muted-foreground font-semibold">mV</span>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-auto">
        <BalancingBadge enabled={cell.balancing} />
      </div>
    </div>
  );
}
