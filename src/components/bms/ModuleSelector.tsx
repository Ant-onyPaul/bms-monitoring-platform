import Select from '../ui/Select';
import { IconModule } from '../icons';

export interface ModuleItem {
  id: string;
  name: string;
  /** Optional trailing detail, e.g. "52 cells". */
  meta?: string;
}

interface ModuleSelectorProps {
  modules: ModuleItem[];
  selectedModule: ModuleItem;
  onSelect: (module: ModuleItem) => void;
  label?: string;
}

export default function ModuleSelector({
  modules,
  selectedModule,
  onSelect,
  label = 'Module',
}: ModuleSelectorProps) {
  return (
    <Select
      options={modules}
      value={selectedModule}
      onChange={onSelect}
      label={label}
      icon={IconModule}
      widthClass="w-full sm:w-56"
    />
  );
}
