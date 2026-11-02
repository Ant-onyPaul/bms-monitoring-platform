import type { Device, Overview, Role } from '../types/database.types';

/* =============================================================================
   Navigation data — what the navbar bell and the command palette show.

   Both read endpoints the app already uses (/api/overview alerts and
   /api/devices, each scoped by the API to the signed-in user); these are the
   pure mappings from those responses, kept here so they can be tested.
   ========================================================================== */

export type NavAlertTone = 'crit' | 'warn' | 'info';

export interface NavAlert {
  id: string;
  tone: NavAlertTone;
  title: string;
  context: string;
  time: string;
}

const TONE: Record<Overview['alerts'][number]['type'], NavAlertTone> = {
  fault: 'crit',
  warning: 'warn',
  info: 'info',
};

/** Overview alerts as bell entries, most severe first, newest first within a severity. */
export function toNavAlerts(alerts: Overview['alerts'], formatAge: (iso: string) => string): NavAlert[] {
  const rank: Record<NavAlertTone, number> = { crit: 0, warn: 1, info: 2 };
  return alerts
    .map((a, index) => ({
      at: Date.parse(a.at) || 0,
      alert: {
        id: `${a.code}-${a.at}-${index}`,
        tone: TONE[a.type] ?? 'info',
        title: a.message,
        context: [a.source, a.code].filter(Boolean).join(' · '),
        time: formatAge(a.at),
      } satisfies NavAlert,
    }))
    .sort((x, y) => rank[x.alert.tone] - rank[y.alert.tone] || y.at - x.at)
    .map((entry) => entry.alert);
}

/** The bell's indicator: the most severe tone present, or null when nothing needs attention. */
export function alertIndicator(alerts: NavAlert[] | null): NavAlertTone | null {
  if (!alerts || alerts.length === 0) return null;
  if (alerts.some((a) => a.tone === 'crit')) return 'crit';
  if (alerts.some((a) => a.tone === 'warn')) return 'warn';
  return 'info';
}

export interface DeviceShortcut {
  id: string;
  label: string;
  hint: string;
  path: string;
}

/** Devices as palette shortcuts, routed under the signed-in role. */
export function toDeviceShortcuts(devices: Device[], role: Role): DeviceShortcut[] {
  return devices.map((d) => ({
    id: `device-${d.id}`,
    label: d.name,
    hint: [d.imei ?? d.device_identifier, d.location].filter(Boolean).join(' · '),
    path: `/${role}/devices/${encodeURIComponent(d.id)}`,
  }));
}
