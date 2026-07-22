import { FiWifi, FiWifiOff } from 'react-icons/fi';

export default function CommunicationBadge({ active }) {
  if (active) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-medium">
        <FiWifi className="w-3.5 h-3.5" />
        <span>Active</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
      <FiWifiOff className="w-3.5 h-3.5" />
      <span>Inactive</span>
    </div>
  );
}
