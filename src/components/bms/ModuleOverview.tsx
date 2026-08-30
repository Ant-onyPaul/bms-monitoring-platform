import { useMemo, useState } from 'react';
import RackSelector, { Rack } from './RackSelector';
import ModuleCard, { BmsModule } from './ModuleCard';
import { Panel, PanelHeader } from '../ui/Panel';
import { Readout } from '../ui/Metric';
import { Badge } from '../ui/Badge';
import PageHeader from '../PageHeader';
import {
  IconRack,
  IconModule,
  IconVoltage,
  IconTemperature,
  IconImbalance,
  IconWarning,
  IconChevronRight,
} from '../icons';

// Dummy Data Generator
const RACKS: Rack[] = [
  { id: 'rack-1', name: 'Rack 1', meta: '12 modules' },
  { id: 'rack-2', name: 'Rack 2', meta: '12 modules' },
  { id: 'rack-3', name: 'Rack 3', meta: '12 modules' },
  { id: 'rack-4', name: 'Rack 4', meta: '12 modules' },
];

const generateDummyModules = (rackId: string): BmsModule[] => {
  const count = 12; // 12 modules per rack
  const modules: BmsModule[] = [];

  for (let i = 1; i <= count; i++) {
    // Generate realistic random variations based on rackId and index
    const baseVoltage = 52.0;
    const baseTemp = 28;

    let voltage = baseVoltage + Math.random() * 1.0;
    let temp = baseTemp + Math.random() * 6;
    let comm = Math.random() > 0.9 ? 'Inactive' : 'Active';
    let health = 'Healthy';
    let deltaV: number | null = null;

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

interface ModuleOverviewProps {
  deviceId?: string;
  onModuleSelect?: (moduleId: string) => void;
}

/* =============================================================================
   ModuleOverview

   A rack-level workbench. The rack panel establishes the population — how many
   modules, in what condition, across what voltage and thermal spread — and the
   attention strip names the specific modules to open before the grid is
   scanned at all. The grid itself is the detail view, not the summary.
   ========================================================================== */

export function ModuleOverview({ deviceId, onModuleSelect }: ModuleOverviewProps) {
  const [selectedRack, setSelectedRack] = useState<Rack>(RACKS[0]);

  // Memoize modules so they don't regenerate on every render, only when rack changes
  const modules = useMemo(() => generateDummyModules(selectedRack.id), [selectedRack.id]);

  // Calculate stats
  const totalModules = modules.length;
  const healthyModules = modules.filter((m) => m.health === 'Healthy').length;
  const warningModules = modules.filter((m) => m.health === 'Warning').length;
  const offlineModules = modules.filter(
    (m) => m.health === 'Offline' || m.health === 'Fault',
  ).length;

  // Find highest imbalance (if any)
  const highestImbalanceId = useMemo(() => {
    let maxDelta = 0;
    let targetId: string | null = null;
    modules.forEach((m) => {
      if (m.deltaV && m.deltaV > maxDelta) {
        maxDelta = m.deltaV;
        targetId = m.id;
      }
    });
    return targetId;
  }, [modules]);

  /* Rack-wide envelopes, so each card's meter is drawn against its peers
     rather than an arbitrary fixed scale. */
  const envelopes = useMemo(() => {
    const live = modules.filter((m) => m.communication === 'Active');
    const source = live.length > 0 ? live : modules;
    const voltages = source.map((m) => m.voltage);
    const temps = source.map((m) => m.temperature);

    const vMin = Math.min(...voltages);
    const vMax = Math.max(...voltages);
    const tMin = Math.min(...temps);
    const tMax = Math.max(...temps);

    return {
      voltage: [vMin - 0.15, vMax + 0.15] as [number, number],
      temp: [Math.floor(tMin - 2), Math.ceil(tMax + 2)] as [number, number],
      vMin,
      vMax,
      tMin,
      tMax,
      vSpread: vMax - vMin,
      meanVoltage: voltages.reduce((a, b) => a + b, 0) / voltages.length,
    };
  }, [modules]);

  const attention = modules.filter((m) => m.health !== 'Healthy');

  return (
    <div>
      <PageHeader
        eyebrow="Rack drill-down"
        title="Module overview"
        description={`Compare every module inside the selected rack${
          deviceId ? ` on device ${deviceId}` : ''
        }. Select a module to open its cell map.`}
        actions={
          <RackSelector racks={RACKS} selectedRack={selectedRack} onSelect={setSelectedRack} />
        }
      />

      {/* ------------------------------------------------ Rack condition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        <Panel className="lg:col-span-5">
          <PanelHeader
            title={`${selectedRack.name} · condition`}
            icon={IconRack}
            meta={`${totalModules} modules`}
            divided
          />

          {/* Health distribution — proportional, so the mix is read as a shape */}
          <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-3 mb-4">
            {healthyModules > 0 && (
              <span
                className="bg-ok"
                style={{
                  width: `${(healthyModules / totalModules) * 100}%`,
                  transition: 'width 500ms var(--ease-precise)',
                }}
              />
            )}
            {warningModules > 0 && (
              <span
                className="bg-warn"
                style={{
                  width: `${(warningModules / totalModules) * 100}%`,
                  transition: 'width 500ms var(--ease-precise)',
                }}
              />
            )}
            {offlineModules > 0 && (
              <span
                className="bg-crit"
                style={{
                  width: `${(offlineModules / totalModules) * 100}%`,
                  transition: 'width 500ms var(--ease-precise)',
                }}
              />
            )}
          </div>

          <ul className="space-y-0">
            <DistributionRow tone="ok" label="Healthy" count={healthyModules} total={totalModules} />
            <DistributionRow
              tone="warn"
              label="Warning"
              count={warningModules}
              total={totalModules}
            />
            <DistributionRow
              tone="crit"
              label="Offline / fault"
              count={offlineModules}
              total={totalModules}
            />
          </ul>
        </Panel>

        <Panel className="lg:col-span-7">
          <PanelHeader title="Rack envelope" icon={IconModule} meta="live modules only" divided />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
            <Readout
              label="Voltage range"
              value={`${envelopes.vMin.toFixed(2)}–${envelopes.vMax.toFixed(2)}`}
              unit="V"
              icon={IconVoltage}
              size="sm"
              hint={`Mean ${envelopes.meanVoltage.toFixed(2)} V`}
            />
            <Readout
              label="Module spread"
              value={envelopes.vSpread.toFixed(2)}
              unit="V"
              icon={IconImbalance}
              size="sm"
              tone={envelopes.vSpread > 0.8 ? 'warn' : 'default'}
              hint="Across the rack"
            />
            <Readout
              label="Thermal range"
              value={`${envelopes.tMin.toFixed(1)}–${envelopes.tMax.toFixed(1)}`}
              unit="°C"
              icon={IconTemperature}
              size="sm"
              tone={envelopes.tMax >= 35 ? 'warn' : 'default'}
              hint={`Δ${(envelopes.tMax - envelopes.tMin).toFixed(1)} °C`}
            />
            <Readout
              label="Reporting"
              value={`${modules.filter((m) => m.communication === 'Active').length}/${totalModules}`}
              icon={IconModule}
              size="sm"
              tone={offlineModules > 0 ? 'crit' : 'ok'}
              hint="CAN link"
            />
          </div>

          {/* Attention strip — names the modules worth opening */}
          {attention.length > 0 && (
            <div className="mt-5 pt-4 border-t border-line">
              <div className="flex items-center gap-2 mb-3">
                <IconWarning size={13} className="text-warn" />
                <span className="label-technical">Needs attention</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attention.map((module) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => onModuleSelect?.(module.id)}
                    className={`
                      group inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-md border
                      text-[11.5px] font-medium cursor-pointer
                      transition-colors duration-150
                      ${
                        module.health === 'Warning'
                          ? 'bg-warn-surface border-warn-line text-warn-ink hover:bg-warn-line/50'
                          : 'bg-crit-surface border-crit-line text-crit-ink hover:bg-crit-line/50'
                      }
                    `}
                  >
                    <span className="data-technical">{module.name}</span>
                    <span className="opacity-60">{module.health}</span>
                    <IconChevronRight size={11} className="opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* ------------------------------------------------ Module grid */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="section-title">Modules</h2>
          <Badge tone="neutral" size="xs">
            {selectedRack.name}
          </Badge>
        </div>

        <div
          key={selectedRack.id}
          className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              isHighestImbalance={module.id === highestImbalanceId}
              onSelect={() => onModuleSelect?.(module.id)}
              voltageRange={envelopes.voltage}
              tempRange={envelopes.temp}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function DistributionRow({
  tone,
  label,
  count,
  total,
}: {
  tone: 'ok' | 'warn' | 'crit';
  label: string;
  count: number;
  total: number;
}) {
  const dotClass = tone === 'ok' ? 'bg-ok' : tone === 'warn' ? 'bg-warn' : 'bg-crit';

  return (
    <li className="flex items-center gap-3 py-2 border-b border-line last:border-b-0">
      <span className={`w-2 h-2 rounded-[2px] shrink-0 ${dotClass}`} />
      <span className="text-[12.5px] text-ink-2 flex-1">{label}</span>
      <span className="data-technical text-[13px] font-medium text-ink">{count}</span>
      <span className="data-technical text-[11px] text-ink-4 w-10 text-right">
        {total > 0 ? Math.round((count / total) * 100) : 0}%
      </span>
    </li>
  );
}
