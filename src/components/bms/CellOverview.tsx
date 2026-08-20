import { useState, useMemo } from 'react';
import ModuleSelector, { ModuleItem } from './ModuleSelector';
import StatCard from '../StatCard';
import CellCard, { BmsCell } from './CellCard';
import SensorCard, { BmsSensor } from './SensorCard';
import { FiArrowUp, FiArrowDown, FiActivity, FiThermometer, FiGrid, FiCheckCircle } from 'react-icons/fi';

// Dummy Data Generators
const MODULES: ModuleItem[] = [
  { id: 'rack-1-mod-1', name: 'Module 01' },
  { id: 'rack-1-mod-2', name: 'Module 02' },
  { id: 'rack-1-mod-3', name: 'Module 03' },
  { id: 'rack-1-mod-4', name: 'Module 04' },
];

const generateDummyCells = (moduleId: string): BmsCell[] => {
  const count = 52;
  const cells: BmsCell[] = [];
  
  for (let i = 1; i <= count; i++) {
    const baseVoltage = 3700;
    let voltage = baseVoltage + Math.floor(Math.random() * 20 - 10);
    let health = 'Healthy';
    let balancing = Math.random() > 0.8;
    
    // Add specific variances for realism
    if (i === 8 && moduleId === 'rack-1-mod-1') {
      voltage = 3420;
      health = 'Warning';
    } else if (i === 22 && moduleId === 'rack-1-mod-1') {
      voltage = 3760;
    } else if (voltage < 3600 || voltage > 3750) {
      health = 'Warning';
    }
    
    cells.push({
      id: `cell-${i}`,
      name: `Cell ${i.toString().padStart(2, '0')}`,
      voltage: voltage,
      health: health,
      balancing: balancing,
    });
  }
  return cells;
};

const generateDummySensors = (moduleId: string): BmsSensor[] => {
  return [
    { id: 'ntc-1', name: 'NTC 1', temperature: 29, status: 'Healthy' },
    { id: 'ntc-2', name: 'NTC 2', temperature: 30, status: 'Healthy' },
    { id: 'ntc-3', name: 'NTC 3', temperature: 31, status: 'Healthy' },
    { id: 'ntc-4', name: 'NTC 4', temperature: moduleId === 'rack-1-mod-1' ? 45 : 32, status: moduleId === 'rack-1-mod-1' ? 'Warning' : 'Healthy' },
  ];
};

interface CellOverviewProps {
  deviceId?: string;
  moduleId?: string;
}

export function CellOverview({ deviceId, moduleId }: CellOverviewProps) {
  const initialModule = MODULES.find(m => m.id === moduleId) || MODULES[0];
  const [selectedModule, setSelectedModule] = useState<ModuleItem>(initialModule);

  // Generate data based on selected module
  const cells = useMemo(() => generateDummyCells(selectedModule.id), [selectedModule.id]);
  const sensors = useMemo(() => generateDummySensors(selectedModule.id), [selectedModule.id]);
  
  // Calculate stats
  const totalCells = cells.length;
  const healthyCells = cells.filter(c => c.health === 'Healthy').length;
  
  const voltages = cells.map(c => c.voltage);
  const highestVoltage = Math.max(...voltages);
  const lowestVoltage = Math.min(...voltages);
  const avgVoltage = Math.round(voltages.reduce((a, b) => a + b, 0) / cells.length);
  const highestTemp = Math.max(...sensors.map(s => s.temperature));

  return (
    <div className="pb-10">
      
      {/* Page Header & Module Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Cell Overview</h2>
          <p className="text-muted-foreground text-sm">
            Monitor every battery cell inside the selected battery module{deviceId ? ` for device ${deviceId}` : ''}.
          </p>
        </div>
        <div className="shrink-0">
          <ModuleSelector 
            modules={MODULES} 
            selectedModule={selectedModule} 
            onSelect={setSelectedModule} 
          />
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
        <StatCard 
          title="Highest Voltage" 
          value={highestVoltage}
          unit="mV"
          icon={FiArrowUp}
          colorClass="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30"
        />
        <StatCard 
          title="Lowest Voltage" 
          value={lowestVoltage}
          unit="mV"
          icon={FiArrowDown}
          colorClass="bg-orange-500/10 text-orange-500 border border-orange-500/30"
        />
        <StatCard 
          title="Avg Voltage" 
          value={avgVoltage}
          unit="mV"
          icon={FiActivity}
          colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/30"
        />
        <StatCard 
          title="High Temp" 
          value={highestTemp}
          unit="°C"
          icon={FiThermometer}
          colorClass="bg-destructive/10 text-destructive border border-destructive/30"
        />
        <StatCard 
          title="Total Cells" 
          value={totalCells}
          icon={FiGrid}
          colorClass="bg-muted/10 text-muted-foreground border border-border"
        />
        <StatCard 
          title="Healthy Cells" 
          value={healthyCells}
          icon={FiCheckCircle}
          colorClass="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30"
        />
      </div>

      {/* NTC Sensors Grid */}
      <div className="mb-8">
        <h3 className="label-technical mb-4">Temperature Sensors (NTC)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {sensors.map(sensor => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      </div>

      {/* Cell Grid */}
      <div>
        <h3 className="label-technical mb-4">Cell Voltage Map (52-Cell Series)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 xl:grid-cols-[repeat(13,minmax(0,1fr))] gap-2">
          {cells.map((cell) => {
            let highlightType: 'highest' | 'lowest' | null = null;
            if (cell.voltage === highestVoltage) highlightType = 'highest';
            else if (cell.voltage === lowestVoltage) highlightType = 'lowest';

            return (
              <CellCard 
                key={cell.id} 
                cell={cell} 
                highlightType={highlightType} 
              />
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
