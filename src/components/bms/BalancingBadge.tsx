import { Badge } from '../ui/Badge';
import { IconBalancing } from '../icons';

interface BalancingBadgeProps {
  enabled: boolean;
}

/**
 * BalancingBadge
 *
 * Passive balancing is informational, never a problem — it is the pack doing
 * its job. It is therefore blue, and the idle state is deliberately quiet so a
 * grid of 52 cells is not covered in badges competing with the voltages.
 */
export default function BalancingBadge({ enabled }: BalancingBadgeProps) {
  if (!enabled) {
    return <span className="label-technical !text-[9.5px] text-ink-4">Idle</span>;
  }

  return (
    <Badge tone="info" size="xs" icon={IconBalancing}>
      Balancing
    </Badge>
  );
}
