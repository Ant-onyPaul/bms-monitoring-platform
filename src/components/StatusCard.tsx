import { FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

export default function StatusCard({ status }) {
  const getStatusConfig = () => {
    switch(status.toLowerCase()) {
      case 'normal':
        return { color: 'text-brand-green', bg: 'bg-green-50', border: 'border-green-100', icon: FiCheckCircle, text: 'System Normal' };
      case 'warning':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', icon: FiAlertTriangle, text: 'Warning Active' };
      default:
        return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: FiXCircle, text: 'System Fault' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="premium-card p-6 h-full flex flex-col justify-center">
      <h3 className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-widest">System Status</h3>
      
      <div className={`flex items-center p-4 rounded-lg border ${config.bg} ${config.border}`}>
        <div className="relative shrink-0">
          <Icon className={`w-10 h-10 ${config.color}`} />
        </div>
        <div className="ml-4">
          <p className="text-xl font-bold text-slate-900 tracking-tight">{config.text}</p>
          <p className="text-sm text-slate-600 mt-0.5">All modules operating within normal parameters.</p>
        </div>
      </div>
    </div>
  );
}
