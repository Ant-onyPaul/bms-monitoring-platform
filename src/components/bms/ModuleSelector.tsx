import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export interface ModuleItem {
  id: string;
  name: string;
}

interface ModuleSelectorProps {
  modules: ModuleItem[];
  selectedModule: ModuleItem;
  onSelect: (module: ModuleItem) => void;
}

export default function ModuleSelector({ modules, selectedModule, onSelect }: ModuleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left z-20">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between items-center w-56 rounded-xl glass-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-black/5 focus:outline-none transition-all duration-300"
        >
          {selectedModule.name}
          <FiChevronDown className={`ml-2 -mr-1 h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-30 mt-2 w-56 origin-top-left rounded-xl glass-panel shadow-lg focus:outline-none animate-slide-up-fade max-h-64 overflow-y-auto custom-scrollbar">
          <div className="py-1">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  onSelect(module);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 ${
                  selectedModule.id === module.id ? 'bg-blue-500/20 text-blue-400 font-medium' : 'text-foreground/90 hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {module.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
