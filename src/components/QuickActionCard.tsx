import { FiRefreshCw, FiDownload, FiClock, FiGrid } from 'react-icons/fi';

export default function QuickActionCard() {
  const actions = [
    { label: 'Refresh', icon: FiRefreshCw, color: 'text-brand-blue', bg: 'bg-brand-blue/10 hover:bg-brand-blue/20', primary: true },
    { label: 'Export Data', icon: FiDownload, color: 'text-brand-green', bg: 'bg-brand-green/10 hover:bg-brand-green/20' },
    { label: 'View History', icon: FiClock, color: 'text-purple-500', bg: 'bg-purple-500/10 hover:bg-purple-500/20' },
    { label: 'Module Details', icon: FiGrid, color: 'text-brand-accent', bg: 'bg-cyan-500/10 hover:bg-cyan-500/20' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150"></div>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6 relative z-10">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 flex-1 relative z-10">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 group/btn hover:-translate-y-1 active:scale-95 ${
                action.primary 
                  ? 'bg-brand-blue/10 border-brand-blue/30 hover:bg-brand-blue/20 hover:border-brand-blue/50 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                  : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/80 hover:border-white/10'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 transition-transform duration-300 group-hover/btn:scale-110 ${action.primary ? 'text-brand-green drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'text-slate-600 group-hover/btn:text-slate-900'}`} />
              <span className={`text-xs font-medium transition-colors ${action.primary ? 'text-brand-green' : 'text-slate-700 group-hover/btn:text-slate-900'}`}>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
