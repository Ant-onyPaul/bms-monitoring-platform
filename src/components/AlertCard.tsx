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
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Recent Alerts</h3>
        <button className="text-xs font-medium text-brand-blue hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full">View All</button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all duration-200 group cursor-pointer">
            <div className="mt-0.5 mr-3 shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ 
                  color: alert.type === 'fault' ? '#EF4444' : alert.type === 'warning' ? '#EAB308' : '#2563EB' 
                }}>
                  {alert.type}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">{alert.time}</span>
              </div>
              <p className="text-sm text-slate-700 truncate group-hover:text-slate-900 transition-colors">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
