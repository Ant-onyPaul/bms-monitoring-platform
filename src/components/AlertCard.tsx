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
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent Alerts</h3>
        <button className="text-xs font-medium text-brand-blue hover:text-blue-400 transition-colors bg-brand-blue/10 hover:bg-brand-blue/20 px-3 py-1.5 rounded-full">View All</button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-slate-800/80 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg cursor-pointer">
            <div className="mt-0.5 mr-4 shrink-0 transition-transform duration-300 group-hover:scale-110">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ 
                  color: alert.type === 'fault' ? '#EF4444' : alert.type === 'warning' ? '#EAB308' : '#2563EB' 
                }}>
                  {alert.type}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">{alert.time}</span>
              </div>
              <p className="text-sm text-slate-700 truncate group-hover:text-slate-900 transition-colors">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
