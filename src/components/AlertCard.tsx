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
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="label-technical">Recent Alerts</h3>
        <button className="label-technical !text-[10px] text-[#10B981] hover:text-[#10B981]/80 transition-colors bg-[#10B981]/10 hover:bg-[#10B981]/20 px-3 py-1.5 rounded-sm">View All</button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start p-3 rounded-md border border-border bg-card hover:bg-muted/50 transition-all duration-200 group cursor-pointer">
            <div className="mt-0.5 mr-3 shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="label-technical" style={{ 
                  color: alert.type === 'fault' ? 'var(--color-destructive)' : alert.type === 'warning' ? '#F59E0B' : '#3B82F6' 
                }}>
                  {alert.type}
                </p>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{alert.time}</span>
              </div>
              <p className="text-sm text-foreground/90 font-medium truncate group-hover:text-foreground transition-colors">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
