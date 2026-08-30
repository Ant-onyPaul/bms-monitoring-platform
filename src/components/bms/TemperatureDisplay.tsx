import { Readout } from '../ui/Metric';
import { IconTemperature } from '../icons';

interface TemperatureDisplayProps {
  temperature: number;
  label?: string;
  /** Above this reading the value escalates to warning colour. */
  warnAbove?: number;
  critAbove?: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * TemperatureDisplay
 *
 * Colours itself from the reading rather than from a caller-supplied tone, so a
 * hot module looks hot in every context it appears in.
 */
export default function TemperatureDisplay({
  temperature,
  label = 'Temperature',
  warnAbove = 35,
  critAbove = 45,
  size = 'sm',
}: TemperatureDisplayProps) {
  const tone = temperature > critAbove ? 'crit' : temperature >= warnAbove ? 'warn' : 'default';

  return (
    <Readout
      label={label}
      value={temperature.toFixed(1)}
      unit="°C"
      icon={IconTemperature}
      tone={tone}
      size={size}
    />
  );
}
