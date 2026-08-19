export default function StatCard({ title, value, unit, icon: Icon, colorClass }) {
  return (
    <div className="premium-card p-5 flex items-center group relative overflow-hidden">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center relative z-10 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-4 relative z-10">
        <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">{title}</p>
        <div className="flex items-baseline mt-1">
          <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
          {unit && <span className="ml-1 font-semibold text-muted-foreground">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
