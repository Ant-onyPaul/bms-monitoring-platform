import { FiThermometer } from 'react-icons/fi';

export default function TemperatureCard({ max, min }) {
  return (
    <div className="premium-card p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="label-technical">Thermal Status</h3>
        <FiThermometer className="w-4 h-4 text-[#F59E0B]" />
      </div>
      
      <div className="flex justify-between items-end mt-2">
        <div>
          <p className="label-technical mb-1">Max</p>
          <div className="flex items-baseline">
            <span className="text-2xl data-technical text-foreground font-medium">{max}</span>
            <span className="text-sm font-semibold text-muted-foreground ml-1">°C</span>
          </div>
        </div>
        
        <div className="w-px h-10 bg-border mx-2"></div>
        
        <div>
          <p className="label-technical mb-1 text-right">Min</p>
          <div className="flex items-baseline justify-end">
            <span className="text-2xl data-technical text-foreground font-medium">{min}</span>
            <span className="text-sm font-semibold text-muted-foreground ml-1">°C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
