import { FiShield } from 'react-icons/fi';

export default function ProtectionCard({ state }) {
  const isConnected = state.toLowerCase() === 'connected';
  
  return (
    <div className="premium-card p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Protection State</h3>
        <FiShield className="w-5 h-5 text-brand-blue" />
      </div>
      
      <div className="flex items-center mt-2">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 border border-slate-200">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-brand-green shadow-sm' : 'bg-red-500 shadow-sm'}`}></div>
        </div>
        
        <div className="ml-4">
          <p className="text-xl font-bold text-slate-900 tracking-tight">{isConnected ? 'Connected' : 'Disconnected'}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-widest">Contactors engaged</p>
        </div>
      </div>
    </div>
  );
}
