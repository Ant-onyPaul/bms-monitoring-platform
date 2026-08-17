import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export interface Rack {
  id: string;
  name: string;
}

interface RackSelectorProps {
  racks: Rack[];
  selectedRack: Rack;
  onSelect: (rack: Rack) => void;
}

export default function RackSelector({ racks, selectedRack, onSelect }: RackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left z-20">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between items-center w-48 rounded-xl glass-card px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/5 focus:outline-none transition-all duration-300"
        >
          {selectedRack.name}
          <FiChevronDown className={`ml-2 -mr-1 h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-30 mt-2 w-48 origin-top-left rounded-xl glass-panel shadow-lg focus:outline-none animate-slide-up-fade">
          <div className="py-1">
            {racks.map((rack) => (
              <button
                key={rack.id}
                onClick={() => {
                  onSelect(rack);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 ${
                  selectedRack.id === rack.id ? 'bg-brand-blue/20 text-brand-blue font-medium' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {rack.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
