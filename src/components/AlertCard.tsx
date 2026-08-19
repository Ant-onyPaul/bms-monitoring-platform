import { FiAlertCircle, FiInfo, FiXOctagon } from 'react-icons/fi';

export default function AlertCard({ alerts }) {
  const getAlertIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'fault': return <FiXOctagon className="text-red-500 w-5 h-5" />;
      case 'warning': return <FiAlertCircle className="text-yellow-500 w-5 h-5" />;
      default: return <FiInfo className="text-brand-blue w-5 h-5" />;
    }
  };

  return (
    <div className="premium-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent Alerts</h3>
        <button className="text-xs font-medium text-[#22C55E] hover:text-[#22C55E]/80 transition-colors bg-[#22C55E]/10 hover:bg-[#22C55E]/20 px-3 py-1.5 rounded-full">View All</button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start p-3 rounded-lg border border-border hover:bg-muted/30 transition-all duration-200 group cursor-pointer">
            <div className="mt-0.5 mr-3 shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ 
                  color: alert.type === 'fault' ? 'var(--color-destructive)' : alert.type === 'warning' ? '#EAB308' : '#3B82F6' 
                }}>
                  {alert.type}
                </p>
                <span className="text-[10px] text-muted-foreground font-medium">{alert.time}</span>
              </div>
              <p className="text-sm text-foreground/90 truncate group-hover:text-foreground transition-colors">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
