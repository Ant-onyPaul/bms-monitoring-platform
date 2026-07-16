export default function GaugeCard({ title, percentage, color }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-10 -translate-y-1/2 translate-x-1/2 transition-opacity duration-1000 ${color.replace('text-', 'bg-')} group-hover:opacity-30`}></div>
      
      <h3 className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-widest self-start relative z-10 w-full">{title}</h3>
      <div className="relative flex items-center justify-center z-10 mt-2 mb-2">
        <svg className="w-28 h-28 transform -rotate-90 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1500 ease-out ${color} drop-shadow-[0_0_6px_currentColor]`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-extrabold text-white tracking-tighter">{percentage}<span className="text-sm font-semibold text-slate-400 ml-0.5">%</span></span>
        </div>
      </div>
    </div>
  );
}
