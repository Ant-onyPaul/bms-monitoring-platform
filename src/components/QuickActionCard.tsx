import { FiRefreshCw, FiDownload, FiClock, FiGrid } from 'react-icons/fi';

export default function QuickActionCard() {
  const actions = [
    { label: 'Refresh', icon: FiRefreshCw, primary: true },
    { label: 'Export Data', icon: FiDownload },
    { label: 'View History', icon: FiClock },
    { label: 'Module Details', icon: FiGrid },
  ];

  return (
    <div className="premium-card p-5 h-full flex flex-col">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 group/btn hover:-translate-y-0.5 active:translate-y-0 ${
                action.primary 
                  ? 'bg-[#22C55E]/10 border-[#22C55E]/30 hover:bg-[#22C55E]/20 hover:border-[#22C55E]/50 text-[#22C55E]' 
                  : 'bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 transition-transform duration-200 group-hover/btn:scale-110 ${action.primary ? 'text-[#22C55E]' : 'text-muted-foreground group-hover/btn:text-foreground'}`} />
              <span className={`text-xs font-medium transition-colors ${action.primary ? 'text-[#22C55E]' : 'text-muted-foreground group-hover/btn:text-foreground'}`}>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
