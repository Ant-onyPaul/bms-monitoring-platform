import { FiShield } from 'react-icons/fi';

export default function ProtectionCard({ state }) {
  const isConnected = state.toLowerCase() === 'connected';
  
  return (
    <div className="premium-card p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Protection State</h3>
        <FiShield className="w-5 h-5 text-blue-400" />
      </div>
      
      <div className="flex items-center mt-2">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-destructive shadow-sm'}`}></div>
        </div>
        
        <div className="ml-4">
          <p className="text-xl font-bold text-foreground tracking-tight">{isConnected ? 'Connected' : 'Disconnected'}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-widest">Contactors engaged</p>
        </div>
      </div>
    </div>
  );
}
