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
          className="inline-flex justify-between items-center w-56 rounded-md bg-card border border-border px-4 py-2.5 text-sm font-bold text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-muted/50 focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/50 transition-all duration-200"
        >
          {selectedModule.name}
          <FiChevronDown className={`ml-2 -mr-1 h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 md:left-0 z-50 mt-1 w-56 origin-top-right md:origin-top-left rounded-md bg-card border border-border shadow-[0_8px_30px_rgba(0,0,0,0.12)] focus:outline-none animate-slide-up-fade max-h-64 overflow-y-auto custom-scrollbar">
          <div className="py-1">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  onSelect(module);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                  selectedModule.id === module.id ? 'bg-[#10B981]/10 text-[#10B981] font-bold' : 'text-foreground/80 hover:bg-muted hover:text-foreground font-medium'
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
