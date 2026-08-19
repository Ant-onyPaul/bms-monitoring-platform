import { FiThermometer } from 'react-icons/fi';

export default function TemperatureCard({ max, min }) {
  return (
    <div className="premium-card p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Temperature</h3>
        <FiThermometer className="w-5 h-5 text-orange-400" />
      </div>
      
      <div className="flex justify-between items-end mt-2">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-semibold">Maximum</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-foreground tracking-tight">{max}</span>
            <span className="text-xs font-medium text-muted-foreground ml-1">°C</span>
          </div>
        </div>
        
        <div className="w-px h-10 bg-border mx-2"></div>
        
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-semibold text-right">Minimum</p>
          <div className="flex items-baseline justify-end">
            <span className="text-2xl font-bold text-foreground tracking-tight">{min}</span>
            <span className="text-xs font-medium text-muted-foreground ml-1">°C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
