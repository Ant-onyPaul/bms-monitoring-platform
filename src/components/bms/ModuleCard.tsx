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
      className={`premium-card p-5 cursor-pointer flex flex-col justify-between h-full group relative transition-all duration-200 hover:-translate-y-0.5
        ${isHighestImbalance ? 'border-orange-500/50 bg-orange-500/10' : 'hover:border-blue-500/50'}`}
    >
      {/* Header section */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg flex items-center justify-center ${isHighestImbalance ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/10 text-blue-400'}`}>
            <FiBattery className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">{module.name}</h3>
        </div>
        <HealthBadge status={module.health} />
      </div>

      {/* Alert section (if highest imbalance) */}
      {isHighestImbalance && module.deltaV && (
        <div className="mb-5">
          <ImbalanceAlert deltaV={module.deltaV} />
        </div>
      )}

      {/* Vitals grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <VoltageDisplay voltage={module.voltage} />
        <TemperatureDisplay temperature={module.temperature} />
      </div>

      {/* Footer / Comm Status */}
      <div className="pt-3 border-t border-border flex justify-between items-center mt-auto">
        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Comm. Status</span>
        <CommunicationBadge active={module.communication === 'Active'} />
      </div>
    </div>
  );
}
