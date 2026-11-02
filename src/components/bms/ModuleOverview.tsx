import { useMemo, useState } from 'react';
import RackSelector, { Rack } from './RackSelector';
import { ModuleNavigator } from './RackOverview';
import { Panel, PanelHeader } from '../ui/Panel';
import PageHeader from '../PageHeader';
import { RackTelemetry } from '../../types/bms.types';
import { IconModule } from '../icons';

/* =============================================================================
   ModuleOverview

   The module level of device → rack → module → cell, as its own tab. It is the
   same navigator Rack Overview ends with — module identity and a way into its
   cells — scoped to one rack at a time. Per-module telemetry stays out, as the
   company's review asked; rack status and cell extremes already name the
   module behind any outlier.

   Presentation only: racks arrive as a prop from the workspace data source.
   ========================================================================== */

interface ModuleOverviewProps {
  racks: RackTelemetry[];
  cellsPerModule: number | null;
  deviceLabel?: string;
  onModuleSelect?: (moduleId: string) => void;
}

export function ModuleOverview({ racks, cellsPerModule, deviceLabel, onModuleSelect }: ModuleOverviewProps) {
  const rackOptions: Rack[] = useMemo(
    () => racks.map((rack) => ({ id: rack.id, name: rack.name, meta: `${rack.modules.length} modules` })),
    [racks],
  );

  const [selectedId, setSelectedId] = useState(rackOptions[0]?.id);
  const rack = racks.find((r) => r.id === selectedId) ?? racks[0];
  const selectedOption = rackOptions.find((r) => r.id === selectedId) ?? rackOptions[0];
  if (!rack) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Rack drill-down"
        title="Module overview"
        description={`Modules installed in the selected rack${deviceLabel ? ` on ${deviceLabel}` : ''}. Select a module to open its cells.`}
        actions={
          <RackSelector
            racks={rackOptions}
            selectedRack={selectedOption}
            onSelect={(option) => setSelectedId(option.id)}
          />
        }
      />

      <Panel flush className="overflow-hidden">
        <div className="px-5 pt-4">
          <PanelHeader
            title={`${rack.name} · modules`}
            icon={IconModule}
            meta={`${rack.modules.length} in rack${cellsPerModule ? ` · ${cellsPerModule} cells each` : ''}`}
            divided
          />
        </div>
        <ModuleNavigator modules={rack.modules} onSelect={onModuleSelect} />
      </Panel>
    </div>
  );
}
