import { FiThermometer } from 'react-icons/fi';
import HealthBadge from './HealthBadge';

export interface BmsSensor {
  id: string;
  name: string;
  temperature: number;
  status: string;
}

interface SensorCardProps {
  sensor: BmsSensor;
}

export default function SensorCard({ sensor }: SensorCardProps) {
  const isAbnormal = sensor.status === 'Warning' || sensor.status === 'Fault';

  return (
    <div className={`premium-card p-4 transition-all duration-200 ${isAbnormal ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-border'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <FiThermometer className={isAbnormal ? 'text-yellow-500' : 'text-muted-foreground'} />
          <h4 className="text-sm font-semibold text-foreground/90">{sensor.name}</h4>
        </div>
        <HealthBadge status={sensor.status} />
      </div>

      <div className="flex items-baseline">
        <span className={`text-2xl font-bold ${isAbnormal ? 'text-yellow-500' : 'text-foreground'}`}>
          {sensor.temperature}
        </span>
        <span className="ml-1 text-xs text-muted-foreground">°C</span>
      </div>
    </div>
  );
}
