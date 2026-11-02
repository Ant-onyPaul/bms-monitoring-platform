import { useEffect, useState } from 'react';
import type { Device, TelemetryPoint } from '../../types/database.types';
import { useDeviceRealtime } from '../../hooks/useDeviceRealtime';
import { getDevice, getTelemetryHistory } from './apiSource';

const HISTORY_REFRESH_MS = 5000;

/** Device record, latest telemetry (polled by useDeviceRealtime) and recent history. */
export function useDeviceWorkspace(id: string) {
  const [device, setDevice] = useState<Device | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const { data: live } = useDeviceRealtime(id);

  useEffect(() => {
    getDevice(id)
      .then(setDevice)
      .catch((e) => setDeviceError(e instanceof Error ? e.message : 'Could not load device'));
  }, [id]);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      getTelemetryHistory(id)
        .then((rows) => { if (alive) setHistory(rows); })
        .catch(() => {});
    refresh();
    const timer = window.setInterval(refresh, HISTORY_REFRESH_MS);
    return () => { alive = false; window.clearInterval(timer); };
  }, [id]);

  return { device, deviceError, live, history };
}
