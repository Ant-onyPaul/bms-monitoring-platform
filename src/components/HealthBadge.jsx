import { FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

export default function HealthBadge({ status }) {
  let config = {};

  switch (status.toLowerCase()) {
    case 'healthy':
      config = { color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/20', icon: FiCheckCircle, text: 'Healthy' };
      break;
    case 'warning':
      config = { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: FiAlertTriangle, text: 'Warning' };
      break;
    case 'fault':
    case 'offline':
    default:
      config = { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: FiXCircle, text: status };
      break;
  }

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} ${config.border} border ${config.color} text-xs font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="capitalize">{config.text}</span>
    </div>
  );
}
