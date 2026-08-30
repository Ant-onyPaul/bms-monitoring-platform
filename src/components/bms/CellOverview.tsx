import { useMemo, useState } from 'react';
import ModuleSelector, { ModuleItem } from './ModuleSelector';
import CellCard, { BmsCell } from './CellCard';
import SensorCard, { BmsSensor } from './SensorCard';
import { Panel, PanelHeader } from '../ui/Panel';
import { Readout, Meter } from '../ui/Metric';
import { Badge, LiveDot } from '../ui/Badge';
import PageHeader from '../PageHeader';
import {
  IconArrowUp,
  IconArrowDown,
  IconVoltage,
  IconImbalance,
  IconBalancing,
  IconCellGrid,
  IconTemperature,
} from '../icons';

// Dummy Data Generators
const MODULES: ModuleItem[] = [
  { id: 'rack-1-mod-1', name: 'Module 01', meta: '52 cells' },
  { id: 'rack-1-mod-2', name: 'Module 02', meta: '52 cells' },
  { id: 'rack-1-mod-3', name: 'Module 03', meta: '52 cells' },
  { id: 'rack-1-mod-4', name: 'Module 04', meta: '52 cells' },
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
    {
      id: 'ntc-4',
      name: 'NTC 4',
      temperature: moduleId === 'rack-1-mod-1' ? 45 : 32,
      status: moduleId === 'rack-1-mod-1' ? 'Warning' : 'Healthy',
    },
  ];
};

interface CellOverviewProps {
  deviceId?: string;
  moduleId?: string;
}

/* =============================================================================
   CellOverview

   The voltage map is the point of this view. Everything above it exists to give
   the map a scale: the spread panel states the module's high, low and delta, so
   the saturation gradient across 52 tiles has known endpoints, and the legend
   makes the encoding explicit rather than something to be inferred.
   ========================================================================== */

export function CellOverview({ deviceId, moduleId }: CellOverviewProps) {
  const initialModule = MODULES.find((m) => m.id === moduleId) || MODULES[0];
  const [selectedModule, setSelectedModule] = useState<ModuleItem>(initialModule);

  // Generate data based on selected module
  const cells = useMemo(() => generateDummyCells(selectedModule.id), [selectedModule.id]);
  const sensors = useMemo(() => generateDummySensors(selectedModule.id), [selectedModule.id]);

  // Calculate stats
  const totalCells = cells.length;
  const healthyCells = cells.filter((c) => c.health === 'Healthy').length;
  const balancingCells = cells.filter((c) => c.balancing).length;

  const voltages = cells.map((c) => c.voltage);
  const highestVoltage = Math.max(...voltages);
  const lowestVoltage = Math.min(...voltages);
  const avgVoltage = Math.round(voltages.reduce((a, b) => a + b, 0) / cells.length);
  const highestTemp = Math.max(...sensors.map((s) => s.temperature));

  const delta = highestVoltage - lowestVoltage;
  const spreadTone = delta > 250 ? 'warn' : 'ok';

  /* Saturation is scaled across the *in-spec* cells only.
     A single failing cell can sit 300 mV below the pack; normalising against it
     would compress all 51 healthy cells into one indistinguishable shade —
     destroying the map exactly when it is most needed. Out-of-spec cells carry
     their own amber treatment, so they do not need the gradient to stand out. */
  const inSpec = cells.filter((c) => c.health === 'Healthy').map((c) => c.voltage);
  const scaleLow = inSpec.length ? Math.min(...inSpec) : lowestVoltage;
  const scaleHigh = inSpec.length ? Math.max(...inSpec) : highestVoltage;
  const scaleSpan = scaleHigh - scaleLow || 1;

  return (
    <div>
      <PageHeader
        eyebrow="Module drill-down"
        title="Cell overview"
        description={`Per-cell voltage, balancing state and local probe temperatures for the selected module${
          deviceId ? ` on device ${deviceId}` : ''
        }.`}
        actions={
          <ModuleSelector
            modules={MODULES}
            selectedModule={selectedModule}
            onSelect={setSelectedModule}
          />
        }
      />

      {/* ------------------------------------------------ Module condition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        <Panel className="lg:col-span-7">
          <PanelHeader
            title={`${selectedModule.name} · cell spread`}
            icon={IconImbalance}
            actions={
              <Badge tone={spreadTone} size="xs">
                Δ{delta} mV
              </Badge>
            }
            divided
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 mb-5">
            <Readout
              label="Highest"
              value={highestVoltage}
              unit="mV"
              icon={IconArrowUp}
              tone="ok"
              size="sm"
            />
            <Readout label="Mean" value={avgVoltage} unit="mV" icon={IconVoltage} size="sm" />
            <Readout
              label="Lowest"
              value={lowestVoltage}
              unit="mV"
              icon={IconArrowDown}
              tone={spreadTone}
              size="sm"
            />
            <Readout
              label="Balancing"
              value={balancingCells}
              icon={IconBalancing}
              tone={balancingCells > 0 ? 'info' : 'default'}
              size="sm"
              hint={`of ${totalCells} cells`}
            />
          </div>

          <Meter
            value={highestVoltage}
            from={lowestVoltage}
            min={3200}
            max={3900}
            tone={spreadTone}
            height={6}
            label="Module cell spread"
          />
          <div className="flex justify-between mt-2.5">
            <span className="data-technical text-[10px] text-ink-4">3200 mV</span>
            <span className="label-technical">Cell operating window</span>
            <span className="data-technical text-[10px] text-ink-4">3900 mV</span>
          </div>
        </Panel>

        <Panel className="lg:col-span-5">
          <PanelHeader
            title="Cell condition"
            icon={IconCellGrid}
            meta={`${totalCells} in series`}
            divided
          />

          <div className="flex items-end justify-between gap-4 mb-5">
            <Readout
              label="Healthy"
              value={healthyCells}
              hint={`${Math.round((healthyCells / totalCells) * 100)}% of module`}
              tone="ok"
            />
            <Readout
              label="Out of spec"
              value={totalCells - healthyCells}
              tone={totalCells - healthyCells > 0 ? 'warn' : 'default'}
              align="right"
              hint="Flagged for review"
            />
          </div>

          <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-3 mb-5">
            <span
              className="bg-ok"
              style={{
                width: `${(healthyCells / totalCells) * 100}%`,
                transition: 'width 500ms var(--ease-precise)',
              }}
            />
            <span className="bg-warn flex-1" />
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-line mt-auto">
            <span className="flex items-center gap-2">
              <IconTemperature size={13} className="text-ink-4" />
              <span className="label-technical">Peak probe</span>
            </span>
            <span className="flex items-center gap-2">
              <LiveDot tone={highestTemp >= 45 ? 'crit' : highestTemp >= 35 ? 'warn' : 'ok'} size={6} />
              <span
                className={`data-technical text-[14px] font-medium ${
                  highestTemp > 45 ? 'text-crit-ink' : highestTemp >= 35 ? 'text-warn-ink' : 'text-ink'
                }`}
              >
                {highestTemp.toFixed(1)}
                <span className="text-[11px] text-ink-4 ml-0.5">°C</span>
              </span>
            </span>
          </div>
        </Panel>
      </div>

      {/* ------------------------------------------------ Local probes */}
      <section className="mb-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="section-title">Temperature probes</h2>
          <span className="label-technical">NTC · local to module</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sensors.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Voltage map */}
      <Panel flush className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <IconCellGrid size={13} className="text-ink-4" />
            <h2 className="label-technical">Voltage map · {totalCells}-cell series</h2>
          </div>
          <MapLegend low={scaleLow} high={scaleHigh} />
        </div>

        <div
          key={selectedModule.id}
          className="p-4 sm:p-5 grid gap-1.5 animate-fade-in
            grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-13"
        >
          {cells.map((cell, index) => {
            let highlightType: 'highest' | 'lowest' | null = null;
            if (cell.voltage === highestVoltage) highlightType = 'highest';
            else if (cell.voltage === lowestVoltage) highlightType = 'lowest';

            return (
              <CellCard
                key={cell.id}
                cell={cell}
                highlightType={highlightType}
                intensity={(cell.voltage - scaleLow) / scaleSpan}
                index={index}
              />
            );
          })}
        </div>

        <p className="px-5 py-3 border-t border-line text-[11.5px] text-ink-4 leading-relaxed">
          Tile saturation encodes each cell's position between the module's lowest and highest
          reading. Amber tiles are out of spec; a blue mark indicates passive balancing is active.
        </p>
      </Panel>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   MapLegend — makes the saturation encoding explicit instead of leaving the
   reader to infer it from the grid.
   -------------------------------------------------------------------------- */

function MapLegend({ low, high }: { low: number; high: number }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="flex items-center gap-2">
        <span className="data-technical text-[10px] text-ink-4">{low}</span>
        <span
          className="w-24 h-2.5 rounded-[3px] border border-line"
          style={{
            background:
              'linear-gradient(to right, rgba(16,185,129,0.08), rgba(16,185,129,0.34))',
          }}
        />
        <span className="data-technical text-[10px] text-ink-4">{high} mV</span>
      </span>

      <span className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-warn-surface border border-warn-line" />
          <span className="text-[11px] text-ink-3">Out of spec</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconBalancing size={11} className="text-info" />
          <span className="text-[11px] text-ink-3">Balancing</span>
        </span>
      </span>
    </div>
  );
}
