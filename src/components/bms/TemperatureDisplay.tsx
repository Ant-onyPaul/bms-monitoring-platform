interface TemperatureDisplayProps {
  temperature: number;
}

export default function TemperatureDisplay({ temperature }: TemperatureDisplayProps) {
  return (
    <div>
      <p className="text-[10px] sm:text-xs text-slate-600 font-semibold tracking-wider uppercase mb-1">High Temp</p>
      <div className="flex items-baseline">
        <span className="text-xl font-bold text-slate-900 tracking-tight">{temperature.toFixed(1)}</span>
        <span className="ml-1 text-xs text-slate-500 font-medium">°C</span>
      </div>
    </div>
  );
}
