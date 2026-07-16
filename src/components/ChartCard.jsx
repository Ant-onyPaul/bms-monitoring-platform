export default function ChartCard({ title, type, data, color }) {
  // A simple placeholder for charts using SVG and CSS
  return (
    <div className="glass-card rounded-2xl p-6 h-72 flex flex-col group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-5 -translate-y-1/2 translate-x-1/2 transition-opacity duration-1000 group-hover:opacity-10`} style={{ backgroundColor: color }}></div>
      
      <h3 className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-widest relative z-10">{title}</h3>
      <div className="flex-1 relative w-full flex items-end justify-between px-2 pb-2 z-10">
        {/* Placeholder Grid lines */}
        <div className="absolute inset-0 border-b border-slate-700/30"></div>
        <div className="absolute inset-y-0 left-0 right-0 flex flex-col justify-between opacity-10">
          <div className="w-full h-px bg-slate-500"></div>
          <div className="w-full h-px bg-slate-500"></div>
          <div className="w-full h-px bg-slate-500"></div>
          <div className="w-full h-px bg-slate-500"></div>
        </div>

        {/* Mock Chart Data visualization */}
        {type === 'bar' && data.map((val, i) => (
          <div key={i} className="relative z-10 w-full mx-1 rounded-t-sm transition-all duration-1000 ease-in-out hover:opacity-80 group/bar cursor-pointer" 
               style={{ height: `${val}%`, backgroundColor: color, boxShadow: `0 -4px 12px ${color}33` }}>
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-slate-800 px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap shadow-lg">{val}</span>
          </div>
        ))}

        {type === 'line' && (
          <svg className="absolute inset-0 w-full h-full z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polyline 
              fill="none" 
              stroke={color} 
              strokeWidth="2.5"
              className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - val}`).join(' ')} 
            />
            {/* Area under curve gradient placeholder */}
            <polygon 
              fill={`url(#gradient-${title.replace(/\s+/g, '')})`} 
              opacity="0.3"
              points={`0,100 ${data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - val}`).join(' ')} 100,100`}
            />
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
    </div>
  );
}
