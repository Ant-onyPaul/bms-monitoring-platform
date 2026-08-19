export default function StatCard({ title, value, unit, icon: Icon, colorClass }) {
  return (
    <div className="glass-card rounded-2xl p-6 flex items-center group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150"></div>
      
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center relative z-10 shadow-inner ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="ml-5 relative z-10">
        <p className="text-xs sm:text-sm text-slate-500 font-semibold tracking-wide uppercase">{title}</p>
        <div className="flex items-baseline mt-1">
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          {unit && <span className="ml-1.5 text-sm font-semibold text-slate-500">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
