import { Badge } from './ui/Badge';

interface StatusBadgeProps {
  lastSeenAt: string | null;
  status?: string; // e.g. 'maintenance', 'inactive'
}

/**
 * StatusBadge
 *
 * Two different questions share this badge, so it answers whichever one the
 * data supports:
 *
 *  - Given a last-seen timestamp (devices), it reports connectivity — online
 *    when telemetry arrived inside the five-minute threshold, offline otherwise.
 *  - Given no timestamp (vendors, customers), there is nothing to be offline
 *    *from*, so it reports the record's own lifecycle status instead.
 *
 * Online pulses because it is genuinely live state. Offline does not — a static
 * dot is the honest rendering of "nothing is arriving".
 */
export default function StatusBadge({ lastSeenAt, status }: StatusBadgeProps) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

  if (status && status !== 'active') {
    return (
      <Badge tone="idle" dot>
        {label}
      </Badge>
    );
  }

  if (!lastSeenAt) {
    return (
      <Badge tone="ok" dot>
        {status ? label : 'Active'}
      </Badge>
    );
  }

  const thresholdMinutes = 5;
  const isOnline =
    new Date().getTime() - new Date(lastSeenAt).getTime() < thresholdMinutes * 60 * 1000;

  return (
    <Badge tone={isOnline ? 'ok' : 'crit'} dot live={isOnline}>
      {isOnline ? 'Online' : 'Offline'}
    </Badge>
  );
}
