import { FiActivity, FiZap, FiBattery } from 'react-icons/fi';
import StatCard from '../StatCard';
import StatusCard from '../StatusCard';
import GaugeCard from '../GaugeCard';
import TemperatureCard from '../TemperatureCard';
import ProtectionCard from '../ProtectionCard';
import ChartCard from '../ChartCard';
import AlertCard from '../AlertCard';
import QuickActionCard from '../QuickActionCard';

interface BmsOverviewProps {
  deviceId?: string;
}

export function BmsOverview({ deviceId }: BmsOverviewProps) {
  // Mock Data
  const alertsData = [
    { type: 'warning', message: 'Module 3 Temperature High', time: '2 minutes ago' },
    { type: 'fault', message: 'Cell 12 Voltage Low', time: '15 minutes ago' },
    { type: 'info', message: 'Realtime connection established', time: 'Just now' },
  ];

  const cellVoltageData = [40, 45, 42, 60, 80, 50, 45, 42, 55, 65, 50, 40, 42, 45, 60, 45];
  const tempTrendData = [30, 32, 35, 38, 40, 42, 41, 39, 38, 37, 35, 33];
  const socTrendData = [90, 88, 85, 82, 80, 78, 75, 74, 82, 85, 88, 92];

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-up-fade">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Overview</h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Realtime vitals for device {deviceId}</p>
        </div>
        <div className="flex flex-col md:items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-green"></span>
            </span>
            <span className="text-sm font-medium text-brand-green">Live Connection</span>
          </div>
          <p className="text-xs text-slate-500">{currentDate}</p>
        </div>
      </div>
      
      {/* Section 1 & 2: Vitals & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Voltage" value="52.8" unit="V" icon={FiActivity} colorClass="bg-brand-blue/10 text-brand-blue" />
          <StatCard title="Total Current" value="18.6" unit="A" icon={FiZap} colorClass="bg-yellow-500/10 text-yellow-500" />
          <StatCard title="Power Output" value="0.98" unit="kW" icon={FiBattery} colorClass="bg-purple-500/10 text-purple-500" />
        </div>
        <div className="lg:col-span-1">
          <StatusCard status="Normal" />
        </div>
      </div>

      {/* Section 3, 4, 5, 6: Gauges, Temp, Protection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GaugeCard title="State of Charge (SOC)" percentage={82} color="text-brand-blue" />
        <GaugeCard title="State of Health (SOH)" percentage={97} color="text-brand-green" />
        <TemperatureCard max={42} min={28} />
        <ProtectionCard state="Connected" />
      </div>

      {/* Section 7 & 8: Realtime Overview & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ChartCard title="SOC Trend (24h)" type="line" data={socTrendData} color="#2563EB" />
        </div>
        <div className="lg:col-span-2">
          <ChartCard title="Cell Voltage Distribution" type="bar" data={cellVoltageData} color="#10B981" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <ChartCard title="Temperature Trend Line" type="line" data={tempTrendData} color="#F97316" />
        </div>
        {/* Section 9 & 10: Alerts & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <AlertCard alerts={alertsData} />
          <QuickActionCard />
        </div>
      </div>

    </div>
  );
}
