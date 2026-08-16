import { FiThermometer } from 'react-icons/fi';
import HealthBadge from './HealthBadge';

export default function SensorCard({ sensor }) {
  const isAbnormal = sensor.status === 'Warning' || sensor.status === 'Fault';

  return (
    <div className={`glass-card rounded-xl p-4 relative overflow-hidden transition-all duration-300 ${isAbnormal ? 'border-yellow-500/30' : 'border-transparent hover:border-white/10'}`}>
      {isAbnormal && (
        <div className="absolute top-0 left-0 w-full h-full bg-yellow-500/5 blur-xl pointer-events-none"></div>
      )}
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <FiThermometer className={isAbnormal ? 'text-yellow-500' : 'text-slate-400'} />
          <h4 className="text-sm font-semibold text-slate-300">{sensor.name}</h4>
        </div>
        <HealthBadge status={sensor.status} />
      </div>

      <div className="flex items-baseline relative z-10">
        <span className={`text-2xl font-bold ${isAbnormal ? 'text-yellow-500' : 'text-white'}`}>
          {sensor.temperature}
        </span>
        <span className="ml-1 text-xs text-slate-500">°C</span>
      </div>
    </div>
  );
}
