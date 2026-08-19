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
    borderClass = 'border-[#22C55E]/50';
    bgClass = 'bg-[#22C55E]/10';
  } else if (isLowest) {
    borderClass = 'border-orange-500/50';
    bgClass = 'bg-orange-500/10';
  }

  return (
    <div 
      className={`premium-card p-4 cursor-pointer flex flex-col justify-between h-full group relative transition-all duration-200 hover:-translate-y-0.5 ${borderClass} ${bgClass}`}
    >
      {/* Header section */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground/90 tracking-tight">{cell.name}</h3>
          {(isHighest || isLowest) && (
            <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider ${isHighest ? 'text-[#22C55E]' : 'text-orange-500'}`}>
              {isHighest ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
              {isHighest ? 'Highest Cell' : 'Lowest Cell'}
            </div>
          )}
        </div>
        <HealthBadge status={cell.health} />
      </div>

      {/* Voltage display */}
      <div className="flex items-baseline mb-4">
        <span className={`text-2xl font-extrabold tracking-tight ${isHighest ? 'text-[#22C55E]' : isLowest ? 'text-orange-500' : 'text-foreground'}`}>
          {cell.voltage}
        </span>
        <span className="ml-1 text-xs text-muted-foreground font-medium">mV</span>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-auto">
        <BalancingBadge enabled={cell.balancing} />
      </div>
    </div>
  );
}
