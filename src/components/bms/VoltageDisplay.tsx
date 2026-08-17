interface VoltageDisplayProps {
  voltage: number;
}

export default function VoltageDisplay({ voltage }: VoltageDisplayProps) {
  return (
    <div>
      <p className="text-[10px] sm:text-xs text-slate-400 font-semibold tracking-wider uppercase mb-1">Avg Voltage</p>
      <div className="flex items-baseline">
        <span className="text-xl font-bold text-white tracking-tight">{voltage.toFixed(1)}</span>
        <span className="ml-1 text-xs text-slate-500 font-medium">V</span>
      </div>
    </div>
  );
}
