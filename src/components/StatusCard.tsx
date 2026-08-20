import { FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

export default function StatusCard({ status }) {
  const getStatusConfig = () => {
    switch(status.toLowerCase()) {
      case 'normal':
        return { color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/30', icon: FiCheckCircle, text: 'System Normal' };
      case 'warning':
        return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: FiAlertTriangle, text: 'Warning Active' };
      default:
        return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: FiXCircle, text: 'System Fault' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="premium-card p-6 h-full flex flex-col justify-center">
      <h3 className="label-technical mb-4">System Status</h3>
      
      <div className={`flex items-center p-4 rounded-md border ${config.bg} ${config.border}`}>
        <div className="relative shrink-0">
          <Icon className={`w-8 h-8 ${config.color}`} />
        </div>
        <div className="ml-4">
          <p className="text-xl data-technical text-foreground font-medium">{config.text}</p>
          <p className="text-xs text-muted-foreground mt-1">All modules operating within normal parameters.</p>
        </div>
      </div>
    </div>
  );
}
