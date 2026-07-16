import { FiShield } from 'react-icons/fi';

export default function ProtectionCard({ state }) {
  const isConnected = state.toLowerCase() === 'connected';
  
  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150 group-hover:bg-brand-blue/20"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Protection State</h3>
        <FiShield className="w-5 h-5 text-brand-blue drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
      </div>
      
      <div className="flex items-center mt-2 relative z-10">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/60 border border-white/5">
          <div className={`w-4 h-4 rounded-full transition-all duration-500 ${isConnected ? 'bg-brand-green shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'}`}></div>
        </div>
        
        <div className="ml-4">
          <p className="text-2xl font-bold text-white tracking-tight">{isConnected ? 'Connected' : 'Disconnected'}</p>
          <p className="text-[10px] text-brand-blue font-medium mt-1 uppercase tracking-widest">Contactors engaged</p>
        </div>
      </div>
    </div>
  );
}
