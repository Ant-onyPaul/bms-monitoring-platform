import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import HealthBadge from './HealthBadge';
import BalancingBadge from './BalancingBadge';

export default function CellCard({ cell, highlightType }) {
  // highlightType can be 'highest', 'lowest', or null
  const isHighest = highlightType === 'highest';
  const isLowest = highlightType === 'lowest';

  let borderClass = 'hover:border-white/10 border-transparent';
  let shadowClass = '';
  let glowColor = '';

  if (isHighest) {
    borderClass = 'border-brand-green/50';
    shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.15)]';
    glowColor = 'bg-brand-green/10';
  } else if (isLowest) {
    borderClass = 'border-orange-500/50';
    shadowClass = 'shadow-[0_0_15px_rgba(249,115,22,0.15)]';
    glowColor = 'bg-orange-500/10';
  }

  return (
    <div 
      className={`glass-card rounded-xl p-4 cursor-pointer flex flex-col justify-between h-full group relative overflow-hidden transition-all duration-300 animate-slide-up-fade ${borderClass} ${shadowClass}`}
    >
      {/* Highlight Glow Background */}
      {(isHighest || isLowest) && (
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[30px] pointer-events-none ${glowColor}`}></div>
      )}

      {/* Header section */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-300 tracking-tight">{cell.name}</h3>
          {(isHighest || isLowest) && (
            <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider ${isHighest ? 'text-brand-green' : 'text-orange-400'}`}>
              {isHighest ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
              {isHighest ? 'Highest Cell' : 'Lowest Cell'}
            </div>
          )}
        </div>
        <HealthBadge status={cell.health} />
      </div>

      {/* Voltage display */}
      <div className="flex items-baseline mb-4 relative z-10">
        <span className={`text-2xl font-extrabold tracking-tight ${isHighest ? 'text-brand-green' : isLowest ? 'text-orange-400' : 'text-white'}`}>
          {cell.voltage}
        </span>
        <span className="ml-1 text-xs text-slate-500 font-medium">mV</span>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center relative z-10">
        <BalancingBadge enabled={cell.balancing} />
      </div>
    </div>
  );
}
