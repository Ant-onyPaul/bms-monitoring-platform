import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ModuleSelector from '../components/ModuleSelector';
import StatCard from '../components/StatCard';
import CellCard from '../components/CellCard';
import SensorCard from '../components/SensorCard';
import { FiArrowUp, FiArrowDown, FiActivity, FiThermometer, FiGrid, FiCheckCircle } from 'react-icons/fi';

// Dummy Data Generators
const MODULES = [
  { id: 'rack-1-mod-1', name: 'Module 01' },
  { id: 'rack-1-mod-2', name: 'Module 02' },
  { id: 'rack-1-mod-3', name: 'Module 03' },
  { id: 'rack-1-mod-4', name: 'Module 04' },
];

const generateDummyCells = (moduleId) => {
  const count = 52;
  const cells = [];
  
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

const generateDummySensors = (moduleId) => {
  return [
    { id: 'ntc-1', name: 'NTC 1', temperature: 29, status: 'Healthy' },
    { id: 'ntc-2', name: 'NTC 2', temperature: 30, status: 'Healthy' },
    { id: 'ntc-3', name: 'NTC 3', temperature: 31, status: 'Healthy' },
    { id: 'ntc-4', name: 'NTC 4', temperature: moduleId === 'rack-1-mod-1' ? 45 : 32, status: moduleId === 'rack-1-mod-1' ? 'Warning' : 'Healthy' },
  ];
};

export default function Cells() {
  const location = useLocation();
  const initialModuleId = location.state?.moduleId;
  
  const initialModule = MODULES.find(m => m.id === initialModuleId) || MODULES[0];
  const [selectedModule, setSelectedModule] = useState(initialModule);

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
    <DashboardLayout>
      <div className="animate-fade-in pb-10">
        
        {/* Page Header & Module Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Cell Overview</h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Monitor every battery cell inside the selected battery module.
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
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-10">
          <StatCard 
            title="Highest Voltage" 
            value={highestVoltage}
            unit="mV"
            icon={FiArrowUp}
            colorClass="bg-brand-green/20 text-brand-green"
          />
          <StatCard 
            title="Lowest Voltage" 
            value={lowestVoltage}
            unit="mV"
            icon={FiArrowDown}
            colorClass="bg-orange-500/20 text-orange-400"
          />
          <StatCard 
            title="Avg Voltage" 
            value={avgVoltage}
            unit="mV"
            icon={FiActivity}
            colorClass="bg-brand-blue/20 text-brand-blue"
          />
          <StatCard 
            title="High Temp" 
            value={highestTemp}
            unit="°C"
            icon={FiThermometer}
            colorClass="bg-red-500/20 text-red-500"
          />
          <StatCard 
            title="Total Cells" 
            value={totalCells}
            icon={FiGrid}
            colorClass="bg-slate-700/50 text-slate-300"
          />
          <StatCard 
            title="Healthy Cells" 
            value={healthyCells}
            icon={FiCheckCircle}
            colorClass="bg-brand-green/20 text-brand-green"
          />
        </div>

        {/* NTC Sensors Grid */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">Temperature Sensors (NTC)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {sensors.map(sensor => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        </div>

        {/* Cell Grid */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Cell Voltages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
            {cells.map((cell) => {
              let highlightType = null;
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
    </DashboardLayout>
  );
}
