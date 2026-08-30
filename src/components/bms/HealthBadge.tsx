import { Badge, toneForHealth } from '../ui/Badge';
import { IconCheckCircle, IconWarning, IconFault, IconOffline } from '../icons';

interface HealthBadgeProps {
  status: string;
  size?: 'xs' | 'sm';
  /** Renders a bare dot + label, for tight grids like the cell map. */
  compact?: boolean;
}

const ICONS: Record<string, any> = {
  ok: IconCheckCircle,
  warn: IconWarning,
  crit: IconFault,
  idle: IconOffline,
};

/**
 * HealthBadge
 *
 * Single source of truth for how a health string is rendered anywhere in the
 * BMS views — module card, cell card, sensor card, table cell. Tone mapping
 * lives in the shared vocabulary so "Warning" is the same amber everywhere.
 */
export default function HealthBadge({ status, size = 'xs', compact = false }: HealthBadgeProps) {
  const tone = toneForHealth(status);
  const Icon = ICONS[tone];
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';

  if (compact) {
    return (
      <Badge tone={tone} size="xs" dot>
        {label}
      </Badge>
    );
  }

  return (
    <Badge tone={tone} size={size} icon={Icon}>
      {label}
    </Badge>
  );
}
