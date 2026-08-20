import { FiActivity, FiZap, FiBattery, FiCpu } from 'react-icons/fi';
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
    <div className="space-y-6">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">System Overview</h2>
          <p className="text-muted-foreground mt-1 text-sm">Realtime vitals for device <span className="font-medium text-foreground/90">{deviceId || 'BMS-101'}</span></p>
        </div>
        <div className="flex flex-col md:items-end gap-1">
          <div className="flex items-center gap-2 bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
            </span>
            <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-widest">Live</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{currentDate}</p>
        </div>
      </div>
      
      {/* Top Row: System Status and Primary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <StatusCard status="Normal" />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Total Voltage" value="52.8" unit="V" icon={FiActivity} colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/30" />
          <StatCard title="Total Current" value="18.6" unit="A" icon={FiZap} colorClass="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30" />
          <StatCard title="Power Output" value="0.98" unit="kW" icon={FiBattery} colorClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30" />
        </div>
      </div>

      {/* Second Row: Gauges and Detailed State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GaugeCard title="State of Charge" percentage={82} color="text-blue-400" />
        <GaugeCard title="State of Health" percentage={97} color="text-[#22C55E]" />
        <TemperatureCard max={42} min={28} />
        <ProtectionCard state="Connected" />
      </div>

      {/* Third Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChartCard title="SOC Trend (24h)" type="line" data={socTrendData} color="#60A5FA" />
        </div>
        <div className="lg:col-span-2">
          <ChartCard title="Cell Voltage Distribution" type="bar" data={cellVoltageData} color="#22C55E" />
        </div>
      </div>
      
      {/* Fourth Row: Temperature Chart & Actions/Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <ChartCard title="Temperature Trend" type="line" data={tempTrendData} color="#FBBF24" />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AlertCard alerts={alertsData} />
          <QuickActionCard />
        </div>
      </div>

    </div>
  );
}
