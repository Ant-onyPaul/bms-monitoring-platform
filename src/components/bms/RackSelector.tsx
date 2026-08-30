import Select from '../ui/Select';
import { IconRack } from '../icons';

export interface Rack {
  id: string;
  name: string;
  /** Optional trailing detail, e.g. "12 modules". */
  meta?: string;
}

interface RackSelectorProps {
  racks: Rack[];
  selectedRack: Rack;
  onSelect: (rack: Rack) => void;
  label?: string;
}

/**
 * RackSelector — the shared listbox, bound to racks.
 *
 * Kept as its own component so the rack and module selectors can diverge later
 * (rack health dots, module fault counts) without touching every call site.
 */
export default function RackSelector({
  racks,
  selectedRack,
  onSelect,
  label = 'Rack',
}: RackSelectorProps) {
  return (
    <Select
      options={racks}
      value={selectedRack}
      onChange={onSelect}
      label={label}
      icon={IconRack}
      widthClass="w-full sm:w-52"
    />
  );
}
