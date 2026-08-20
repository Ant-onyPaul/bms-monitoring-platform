import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ChartCard({ title, type, data, color }) {
  // Format data for recharts
  const chartData = data.map((value, index) => ({
    name: `T${index}`,
    value: value
  }));

  return (
    <div className="premium-card p-5 h-72 flex flex-col relative overflow-hidden">
      <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest relative z-10">{title}</h3>
      <div className="flex-1 w-full h-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: color, stroke: 'var(--color-background)', strokeWidth: 2 }} />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip 
                cursor={{ fill: 'var(--color-muted)' }}
                contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
              />
              <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
