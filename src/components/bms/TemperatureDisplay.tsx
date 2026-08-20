interface TemperatureDisplayProps {
  temperature: number;
}

export default function TemperatureDisplay({ temperature }: TemperatureDisplayProps) {
  return (
    <div>
      <p className="label-technical mb-1">High Temp</p>
      <div className="flex items-baseline">
        <span className="text-xl data-technical text-foreground font-medium">{temperature.toFixed(1)}</span>
        <span className="ml-1 text-sm font-semibold text-muted-foreground">°C</span>
      </div>
    </div>
  );
}
