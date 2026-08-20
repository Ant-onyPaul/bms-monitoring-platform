export default function StatCard({ title, value, unit, icon: Icon, colorClass }) {
  return (
    <div className="premium-card p-5 flex items-center group relative overflow-hidden">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center relative z-10 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-4 relative z-10">
        <p className="label-technical mb-1">{title}</p>
        <div className="flex items-baseline">
          <h3 className="text-2xl data-technical text-foreground font-medium">{value}</h3>
          {unit && <span className="ml-1 text-sm font-semibold text-muted-foreground">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
