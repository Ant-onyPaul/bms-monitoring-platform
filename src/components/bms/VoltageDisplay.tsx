interface VoltageDisplayProps {
  voltage: number;
}

export default function VoltageDisplay({ voltage }: VoltageDisplayProps) {
  return (
    <div>
      <p className="label-technical mb-1">Avg Voltage</p>
      <div className="flex items-baseline">
        <span className="text-xl data-technical text-foreground font-medium">{voltage.toFixed(1)}</span>
        <span className="ml-1 text-sm font-semibold text-muted-foreground">V</span>
      </div>
    </div>
  );
}
