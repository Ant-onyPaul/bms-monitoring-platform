import { Meter } from '../ui/Metric';
import { IconTemperature } from '../icons';
import HealthBadge from './HealthBadge';

export interface BmsSensor {
  id: string;
  name: string;
  temperature: number;
  status: string;
}

interface SensorCardProps {
  sensor: BmsSensor;
  /** Operating window the probe is judged against. */
  range?: [number, number];
}

/**
 * SensorCard
 *
 * An NTC probe reading placed inside its operating window. The window matters
 * more than the number here — 45 °C means nothing on its own, but 45 °C against
 * a 15–50 °C envelope reads instantly as "near the top".
 */
export default function SensorCard({ sensor, range = [15, 50] }: SensorCardProps) {
  // 45 °C is the configured warning limit; only a reading past it is critical.
  const tone = sensor.temperature > 45 ? 'crit' : sensor.temperature >= 35 ? 'warn' : 'ok';

  const valueClass =
    tone === 'crit' ? 'text-crit-ink' : tone === 'warn' ? 'text-warn-ink' : 'text-ink';

  return (
    <div
      className={`bg-surface border rounded-[10px] p-4 shadow-[var(--shadow-e1)]
        ${tone === 'crit' ? 'border-crit-line' : tone === 'warn' ? 'border-warn-line' : 'border-line'}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="flex items-center gap-1.5 min-w-0">
          <IconTemperature size={12} className="text-ink-4 shrink-0" />
          <span className="label-technical truncate">{sensor.name}</span>
        </span>
        <HealthBadge status={sensor.status} />
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className={`data-technical text-[22px] font-medium leading-none ${valueClass}`}>
          {sensor.temperature.toFixed(1)}
        </span>
        <span className="text-[12px] font-medium text-ink-4">°C</span>
      </div>

      <Meter
        value={sensor.temperature}
        min={range[0]}
        max={range[1]}
        nominal={[range[0], 35]}
        tone={tone}
        height={4}
        showTicks
        label={`${sensor.name} temperature`}
      />
    </div>
  );
}
