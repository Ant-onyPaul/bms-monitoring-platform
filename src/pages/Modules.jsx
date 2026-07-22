import { useState, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import RackSelector from '../components/RackSelector';
import StatCard from '../components/StatCard';
import ModuleCard from '../components/ModuleCard';
import { FiGrid, FiCheckCircle, FiAlertTriangle, FiWifiOff } from 'react-icons/fi';

// Dummy Data Generator
const RACKS = [
  { id: 'rack-1', name: 'Rack 1' },
  { id: 'rack-2', name: 'Rack 2' },
  { id: 'rack-3', name: 'Rack 3' },
  { id: 'rack-4', name: 'Rack 4' },
];

const generateDummyModules = (rackId) => {
  const count = 12; // 12 modules per rack
  const modules = [];
  
  for (let i = 1; i <= count; i++) {
    // Generate realistic random variations based on rackId and index
    const baseVoltage = 52.0;
    const baseTemp = 28;
    
    let voltage = baseVoltage + (Math.random() * 1.0);
    let temp = baseTemp + (Math.random() * 6);
    let comm = Math.random() > 0.9 ? 'Inactive' : 'Active';
    let health = 'Healthy';
    let deltaV = null;
    
    // Add some artificial variance to specific modules to match requirements
    if (i === 3 && rackId === 'rack-1') {
      voltage = 52.3;
      temp = 38.5;
      deltaV = 0.12;
      health = 'Warning';
    } else if (i === 4 && rackId === 'rack-1') {
      comm = 'Inactive';
      health = 'Offline';
    } else if (i === 8 && rackId === 'rack-2') {
      voltage = 53.1;
      deltaV = 0.15;
      health = 'Warning';
    } else if (i === 11 && rackId === 'rack-3') {
      health = 'Fault';
      comm = 'Inactive';
    } else if (comm === 'Inactive') {
      health = 'Offline';
    } else if (temp > 35) {
      health = 'Warning';
    }
    
    modules.push({
      id: `${rackId}-mod-${i}`,
      name: `Module ${i.toString().padStart(2, '0')}`,
      voltage: parseFloat(voltage.toFixed(2)),
      temperature: parseFloat(temp.toFixed(1)),
      communication: comm,
      health: health,
      deltaV: deltaV,
    });
  }
  return modules;
};

export default function Modules() {
  const [selectedRack, setSelectedRack] = useState(RACKS[0]);
  
  // Memoize modules so they don't regenerate on every render, only when rack changes
  const modules = useMemo(() => generateDummyModules(selectedRack.id), [selectedRack.id]);
  
  // Calculate stats
  const totalModules = modules.length;
  const healthyModules = modules.filter(m => m.health === 'Healthy').length;
  const warningModules = modules.filter(m => m.health === 'Warning').length;
  const offlineModules = modules.filter(m => m.health === 'Offline' || m.health === 'Fault').length;
  
  // Find highest imbalance (if any)
  const highestImbalanceId = useMemo(() => {
    let maxDelta = 0;
    let targetId = null;
    modules.forEach(m => {
      if (m.deltaV && m.deltaV > maxDelta) {
        maxDelta = m.deltaV;
        targetId = m.id;
      }
    });
    return targetId;
  }, [modules]);

  return (
    <DashboardLayout>
      <div className="animate-fade-in pb-10">
        
        {/* Page Header & Rack Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Module Overview</h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Monitor and compare every battery module inside the selected battery rack.
            </p>
          </div>
          <div className="shrink-0">
            <RackSelector 
              racks={RACKS} 
              selectedRack={selectedRack} 
              onSelect={setSelectedRack} 
            />
          </div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <StatCard 
            title="Total Modules" 
            value={totalModules}
            icon={FiGrid}
            colorClass="bg-brand-blue/20 text-brand-blue"
          />
          <StatCard 
            title="Healthy Modules" 
            value={healthyModules}
            icon={FiCheckCircle}
            colorClass="bg-brand-green/20 text-brand-green"
          />
          <StatCard 
            title="Warning Modules" 
            value={warningModules}
            icon={FiAlertTriangle}
            colorClass="bg-yellow-500/20 text-yellow-500"
          />
          <StatCard 
            title="Offline / Fault" 
            value={offlineModules}
            icon={FiWifiOff}
            colorClass="bg-red-500/20 text-red-500"
          />
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {modules.map((module) => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              isHighestImbalance={module.id === highestImbalanceId} 
            />
          ))}
        </div>
        
      </div>
    </DashboardLayout>
  );
}
