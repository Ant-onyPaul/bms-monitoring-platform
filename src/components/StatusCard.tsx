import { FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

export default function StatusCard({ status }) {
  const getStatusConfig = () => {
    switch(status.toLowerCase()) {
      case 'normal':
        return { color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/20', icon: FiCheckCircle, text: 'System Normal' };
      case 'warning':
        return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: FiAlertTriangle, text: 'Warning Active' };
      default:
        return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: FiXCircle, text: 'System Fault' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-center relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2 transition-opacity duration-1000 ${config.bg.replace('/10', '')} group-hover:opacity-40`}></div>
      
      <h3 className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-widest relative z-10">System Status</h3>
      
      <div className={`relative z-10 flex items-center p-5 rounded-xl border ${config.bg} ${config.border} transition-all duration-500`}>
        <div className="relative">
          <Icon className={`w-10 h-10 ${config.color} relative z-10`} />
          {status.toLowerCase() === 'normal' && (
            <div className="absolute inset-0 bg-brand-green rounded-full blur-md opacity-40 animate-pulse"></div>
          )}
        </div>
        <div className="ml-5">
          <p className="text-2xl font-bold text-white tracking-tight">{config.text}</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">All modules operating within normal parameters.</p>
        </div>
      </div>
    </div>
  );
}
