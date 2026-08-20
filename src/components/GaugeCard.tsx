export default function GaugeCard({ title, percentage, color }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="premium-card p-5 flex flex-col items-center justify-center h-full">
      <h3 className="label-technical mb-4 self-start w-full">{title}</h3>
      <div className="relative flex items-center justify-center mt-2 mb-2">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="var(--color-border)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${color}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl data-technical text-foreground font-medium">{percentage}<span className="text-xs font-semibold text-muted-foreground ml-0.5">%</span></span>
        </div>
      </div>
    </div>
  );
}
