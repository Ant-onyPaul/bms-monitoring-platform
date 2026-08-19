import { FiBattery } from 'react-icons/fi';
import CommunicationBadge from './CommunicationBadge';
import HealthBadge from './HealthBadge';
import VoltageDisplay from './VoltageDisplay';
import TemperatureDisplay from './TemperatureDisplay';
import ImbalanceAlert from './ImbalanceAlert';

export interface BmsModule {
  id: string;
  name: string;
  voltage: number;
  temperature: number;
  communication: string;
  health: string;
  deltaV: number | null;
}

interface ModuleCardProps {
  module: BmsModule;
  isHighestImbalance: boolean;
  onSelect?: () => void;
}

export default function ModuleCard({ module, isHighestImbalance, onSelect }: ModuleCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`glass-card rounded-2xl p-5 cursor-pointer flex flex-col justify-between h-full group relative overflow-hidden transition-all duration-300 animate-slide-up-fade
        ${isHighestImbalance ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'hover:border-white/10'}`}
    >
      {/* Imbalance Glow Background */}
      {isHighestImbalance && (
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-orange-500/10 blur-[40px] pointer-events-none"></div>
      )}

      {/* Header section */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg flex items-center justify-center ${isHighestImbalance ? 'bg-orange-500/10 text-orange-400' : 'bg-brand-blue/10 text-brand-blue'}`}>
            <FiBattery className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{module.name}</h3>
        </div>
        <HealthBadge status={module.health} />
      </div>

      {/* Alert section (if highest imbalance) */}
      {isHighestImbalance && module.deltaV && (
        <div className="mb-6 relative z-10">
          <ImbalanceAlert deltaV={module.deltaV} />
        </div>
      )}

      {/* Vitals grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <VoltageDisplay voltage={module.voltage} />
        <TemperatureDisplay temperature={module.temperature} />
      </div>

      {/* Footer / Comm Status */}
      <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto relative z-10">
        <span className="text-[10px] sm:text-xs text-slate-600 font-medium">Comm. Status</span>
        <CommunicationBadge active={module.communication === 'Active'} />
      </div>
    </div>
  );
}
