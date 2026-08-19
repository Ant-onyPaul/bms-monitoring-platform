interface BmsAlertsProps {
  deviceId?: string;
}

export function BmsAlerts({ deviceId }: BmsAlertsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] animate-slide-up-fade">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Alerts</h2>
      <p className="text-slate-600">Alerts log for device {deviceId} coming soon</p>
    </div>
  );
}
