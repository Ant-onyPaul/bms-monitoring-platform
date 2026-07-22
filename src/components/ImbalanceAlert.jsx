import { FiAlertTriangle } from 'react-icons/fi';

export default function ImbalanceAlert({ deltaV }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold animate-pulse-glow shadow-[0_0_10px_rgba(249,115,22,0.3)]">
      <FiAlertTriangle className="w-3.5 h-3.5" />
      <span>Highest Voltage Imbalance (ΔV: {deltaV}V)</span>
    </div>
  );
}
