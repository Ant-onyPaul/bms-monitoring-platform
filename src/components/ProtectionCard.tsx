import { FiShield } from 'react-icons/fi';

export default function ProtectionCard({ state }) {
  const isConnected = state.toLowerCase() === 'connected';
  
  return (
    <div className="premium-card p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="label-technical">Protection State</h3>
        <FiShield className="w-4 h-4 text-blue-500" />
      </div>
      
      <div className="flex items-center mt-2">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-md bg-muted/50 border border-border">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-destructive shadow-sm'}`}></div>
        </div>
        
        <div className="ml-4">
          <p className="text-xl data-technical text-foreground font-medium">{isConnected ? 'Connected' : 'Disconnected'}</p>
          <p className="label-technical mt-1">Contactors engaged</p>
        </div>
      </div>
    </div>
  );
}
