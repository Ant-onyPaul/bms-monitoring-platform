import { compressTimeSeries } from '../../utils/timeSeries';

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

interface BmsHistoryProps {
  deviceId?: string;
}

export function BmsHistory({ deviceId }: BmsHistoryProps) {
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
    <div className="space-y-6 pb-10">
      <div className="premium-card p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label-technical mb-2">History & Trends</p>
            <h2 className="text-2xl font-bold text-foreground tracking-tight uppercase">Battery trend stored as intervals</h2>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Repeated values are stored once until the next meaningful change.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="premium-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="label-technical">SOC history</h3>
            <span className="rounded-sm border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-[#10B981]">
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
                stroke="var(--color-border)"
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
                    rx="2"
                    fill="#10B981"
                    opacity="0.9"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="premium-card p-6">
          <h3 className="label-technical">Stored segments</h3>
          <div className="mt-6 space-y-3">
            {compressedSeries.map((segment) => (
              <div key={`${segment.startTime}-${segment.endTime}`} className="rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between text-sm text-foreground font-bold">
                  <span className="text-xl data-technical tracking-tight">{segment.value}%</span>
                  <span className="text-[#10B981] label-technical">{segment.endTime ? 'active interval' : 'current value'}</span>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  {segment.startTime} &rarr; {segment.endTime || 'now'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
