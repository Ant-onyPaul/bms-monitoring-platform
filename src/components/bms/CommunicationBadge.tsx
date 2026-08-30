import { Badge } from '../ui/Badge';
import { IconComms, IconCommsOff } from '../icons';

interface CommunicationBadgeProps {
  active: boolean;
}

/**
 * CommunicationBadge
 *
 * CAN-bus link state for a module. An active link pulses because frames are
 * genuinely arriving; a lost link is drawn static and critical, since a module
 * that has stopped reporting is a fault, not an idle state.
 */
export default function CommunicationBadge({ active }: CommunicationBadgeProps) {
  return active ? (
    <Badge tone="ok" size="xs" icon={IconComms}>
      Linked
    </Badge>
  ) : (
    <Badge tone="crit" size="xs" icon={IconCommsOff}>
      No link
    </Badge>
  );
}
