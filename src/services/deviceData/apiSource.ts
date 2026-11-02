import { api } from '../../lib/api';
import type { Device, TelemetryPoint } from '../../types/database.types';

/* =============================================================================
   API source — every request the device workspace makes.

   Only endpoints the backend is known to serve are called here. The API client
   signs the user out on any 401, and this backend answers unknown routes with
   401, so speculative requests to endpoints that may not exist are not safe.

   To connect a new section (racks, cells, alerts…):
     1. add its request here,
     2. map the response in liveAdapters.ts to the shape in types.ts,
     3. set its entry in LIVE_SECTIONS to true.
   The views already render that shape; no UI change is needed.
   ========================================================================== */

export const HISTORY_POINTS = 120;

export const getDevice = (id: string) => api<Device>(`/api/devices/${encodeURIComponent(id)}`);

export const getTelemetryHistory = (id: string, limit = HISTORY_POINTS) =>
  api<TelemetryPoint[]>(`/api/devices/${encodeURIComponent(id)}/telemetry/history?limit=${limit}`);

// telemetry/latest is polled by hooks/useDeviceRealtime.ts.
