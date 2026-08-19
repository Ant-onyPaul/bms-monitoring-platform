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
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 group/btn hover:-translate-y-0.5 active:translate-y-0 ${
                action.primary 
                  ? 'bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200 text-brand-blue' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 transition-transform duration-200 group-hover/btn:scale-110 ${action.primary ? 'text-brand-blue' : 'text-slate-500 group-hover/btn:text-slate-700'}`} />
              <span className={`text-xs font-medium transition-colors ${action.primary ? 'text-brand-blue' : 'text-slate-600 group-hover/btn:text-slate-900'}`}>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
