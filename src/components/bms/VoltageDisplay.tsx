import { Readout } from '../ui/Metric';
import { IconVoltage } from '../icons';

interface VoltageDisplayProps {
  voltage: number;
  label?: string;
  tone?: 'default' | 'ok' | 'warn' | 'crit' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export default function VoltageDisplay({
  voltage,
  label = 'Voltage',
  tone = 'default',
  size = 'sm',
}: VoltageDisplayProps) {
  return (
    <Readout
      label={label}
      value={voltage.toFixed(2)}
      unit="V"
      icon={IconVoltage}
      tone={tone}
      size={size}
    />
  );
}
