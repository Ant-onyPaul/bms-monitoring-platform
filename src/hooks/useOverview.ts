import { useEffect, useState } from 'react';
import { AlertItem } from '../components/AlertCard';
import { relativeTime } from '../components/tableCells';
import { Overview } from '../types/database.types';
import { api } from '../lib/api';

const REFRESH_MS = 15_000;
const INGEST_STALE_MS = 5 * 60 * 1000;

/** Dashboard figures, polled. The API scopes them to the signed-in user's role. */
export function useOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      api<Overview>('/api/overview')
        .then((data) => { if (alive) { setOverview(data); setError(null); } })
        .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'Could not load overview'); });
    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const counts = overview?.counts;
  const devices = counts?.devices ?? 0;
  const online = counts?.online ?? 0;
  const lastIngest = counts?.last_ingest_at ?? null;

  return {
    overview,
    error,
    devices,
    online,
    offline: devices - online,
    /** Share of devices reporting now, 0 for an empty fleet. */
    reportingPct: devices ? (online / devices) * 100 : 0,
    lastIngest,
    ingestFresh: !!lastIngest && Date.now() - new Date(lastIngest).getTime() < INGEST_STALE_MS,
    alerts: (overview?.alerts ?? []).map<AlertItem>((a) => ({
      type: a.type,
      message: a.message,
      time: relativeTime(a.at),
      source: a.source,
      code: a.code,
      detail: a.detail,
    })),
  };
}
