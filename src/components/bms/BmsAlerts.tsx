import AlertCard from './../AlertCard';

interface BmsAlertsProps {
  deviceId?: string;
}

export function BmsAlerts({ deviceId }: BmsAlertsProps) {
  // Mock Data
  const alertsData = [
    { type: 'warning', message: 'Module 3 Temperature High', time: '2 minutes ago' },
    { type: 'fault', message: 'Cell 12 Voltage Low', time: '15 minutes ago' },
    { type: 'info', message: 'Realtime connection established', time: 'Just now' },
    { type: 'warning', message: 'SOC imbalance detected', time: '1 hour ago' },
    { type: 'info', message: 'Firmware update completed', time: '2 days ago' },
  ];

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">System Alerts</h2>
        <p className="text-slate-500 text-sm">Alerts log for device <span className="font-medium text-slate-700">{deviceId || 'BMS-101'}</span></p>
      </div>
      <div className="h-[60vh]">
        <AlertCard alerts={alertsData} />
      </div>
    </div>
  );
}
