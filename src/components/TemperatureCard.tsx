import { FiThermometer } from 'react-icons/fi';

export default function TemperatureCard({ max, min }) {
  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150 group-hover:bg-orange-500/20"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Temperature</h3>
        <FiThermometer className="w-5 h-5 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
      </div>
      
      <div className="flex justify-between items-end mt-2 relative z-10">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">Maximum</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-extrabold text-white tracking-tight">{max}</span>
            <span className="text-sm font-semibold text-slate-400 ml-1">°C</span>
          </div>
        </div>
        
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-600 to-transparent mx-2"></div>
        
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold text-right">Minimum</p>
          <div className="flex items-baseline justify-end">
            <span className="text-3xl font-extrabold text-white tracking-tight">{min}</span>
            <span className="text-sm font-semibold text-slate-400 ml-1">°C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
