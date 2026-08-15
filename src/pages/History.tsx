import DashboardLayout from '../components/DashboardLayout';
import { compressTimeSeries } from '../utils/timeSeries';

const rawSampleData = [
  { timestamp: '2026-07-27T00:00:00Z', value: 78.2 },
  { timestamp: '2026-07-27T00:15:00Z', value: 78.2 },
  { timestamp: '2026-07-27T00:30:00Z', value: 78.5 },
  { timestamp: '2026-07-27T00:45:00Z', value: 78.5 },
  { timestamp: '2026-07-27T01:00:00Z', value: 77.9 },
  { timestamp: '2026-07-27T01:15:00Z', value: 77.9 },
  { timestamp: '2026-07-27T01:30:00Z', value: 79.1 },
  { timestamp: '2026-07-27T01:45:00Z', value: 79.1 }
];

export default function History() {
  const compressedSeries = compressTimeSeries(rawSampleData, { threshold: 0.3 });
  const maxValue = Math.max(...compressedSeries.map((segment) => segment.value), 80);
  const minValue = Math.min(...compressedSeries.map((segment) => segment.value), 75);
  const chartHeight = 220;
  const chartWidth = 560;
  const padding = 24;
  const usableHeight = chartHeight - padding * 2;
  const usableWidth = chartWidth - padding * 2;
  const segmentWidth = usableWidth / Math.max(compressedSeries.length, 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Change-based history</p>
              <h2 className="text-2xl font-bold text-white">Battery trend stored as intervals</h2>
            </div>
            <p className="text-sm text-slate-400">Repeated values are stored once until the next meaningful change.</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">SOC history</h3>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                {compressedSeries.length} stored intervals
              </span>
            </div>

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1={padding}
                  x2={chartWidth - padding}
                  y1={padding + usableHeight * ratio}
                  y2={padding + usableHeight * ratio}
                  stroke="rgba(148, 163, 184, 0.25)"
                  strokeDasharray="4 4"
                />
              ))}

              {compressedSeries.map((segment, index) => {
                const normalizedValue = (segment.value - minValue) / (maxValue - minValue || 1);
                const x = padding + index * segmentWidth;
                const y = padding + usableHeight * (1 - normalizedValue);
                const rectWidth = segmentWidth - 10;

                return (
                  <g key={`${segment.startTime}-${segment.endTime}`}>
                    <rect
                      x={x + 5}
                      y={y}
                      width={rectWidth}
                      height={chartHeight - padding * 2 - y + padding}
                      rx="10"
                      fill="rgba(16, 185, 129, 0.28)"
                      stroke="rgba(16, 185, 129, 0.9)"
                      strokeWidth="2"
                    />
                    <line
                      x1={x + 5}
                      x2={x + 5}
                      y1={y}
                      y2={chartHeight - padding}
                      stroke="rgba(16, 185, 129, 0.8)"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white">Stored segments</h3>
            <div className="mt-4 space-y-3">
              {compressedSeries.map((segment) => (
                <div key={`${segment.startTime}-${segment.endTime}`} className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-3">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{segment.value}%</span>
                    <span className="text-emerald-300">{segment.endTime ? 'active interval' : 'current value'}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {segment.startTime} → {segment.endTime || 'now'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
