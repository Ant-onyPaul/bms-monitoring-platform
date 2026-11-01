import { useEffect, useState } from 'react';
import { DeviceCurrentData } from '../types/database.types';
import { api } from '../lib/api';

export function useDeviceRealtime(deviceId: string, initialData?: DeviceCurrentData) {
  const [data, setData] = useState<DeviceCurrentData | null>(initialData || null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    if (!deviceId) return;
    let alive = true;
    const refresh = () => api<DeviceCurrentData>(`/api/devices/${deviceId}/telemetry/latest`).then((d) => { if (alive) setData(d); }).catch((e) => { if (alive) setError(e); });
    refresh();
    const timer = window.setInterval(refresh, 3000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [deviceId]);
  return { data, error };
}
