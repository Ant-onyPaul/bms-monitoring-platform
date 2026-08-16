import { FiZap, FiZapOff } from 'react-icons/fi';

export default function BalancingBadge({ enabled }) {
  if (enabled) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-[10px] font-semibold tracking-wide uppercase">
        <FiZap className="w-3 h-3" />
        <span>Balancing</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-600/30 bg-slate-700/10 text-slate-400 text-[10px] font-semibold tracking-wide uppercase">
      <FiZapOff className="w-3 h-3" />
      <span>Idle</span>
    </div>
  );
}
