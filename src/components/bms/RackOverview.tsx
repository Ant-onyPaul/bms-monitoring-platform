import { useMemo, useState } from 'react';
import RackSelector, { Rack } from './RackSelector';
import RackExtremes from './RackExtremes';
import { OperatingStateBadge, OperatingStatePanel } from './OperatingState';
import { FaultInline } from './FaultBanner';
import { Panel, PanelHeader } from '../ui/Panel';
import { Readout } from '../ui/Metric';
import { Badge, LiveDot } from '../ui/Badge';
import PageHeader from '../PageHeader';
import { getSystemTelemetry } from '../../data/bmsTelemetry';
import { RackModule, RackTelemetry, operatingStateLabel } from '../../types/bms.types';
import {
  IconRack,
  IconVoltage,
  IconCurrent,
  IconPower,
  IconCharge,
  IconHealth,
  IconCycle,
  IconEnergy,
  IconContactor,
  IconModule,
  IconChevronRight,
  IconImbalance,
  IconCheckCircle,
  IconWarning,
  IconFault,
} from '../icons';

/* =============================================================================
   RackOverview

   The rack-level engineering screen. Ordered by the questions an operator
   actually asks:

     1. Which rack am I looking at, and how do the others compare?
     2. What is its status, and what is it doing right now?
     3. Is anything faulted?
     4. What are its electrical and energy figures?
     5. Where are the extremes — which cell, which module?
     6. Only then: a way through to a module's cells.

   Per-module summary data is deliberately absent. The company's review said it
   was not needed, so the module row at the bottom is a *navigator* — module
   identity and nothing else — which keeps the module → cell drill-down without
   restating twelve modules' worth of telemetry the rack panels already cover.
   ========================================================================== */

/* -----------------------------------------------------------------------------
   Rack status

   The rack-level counterpart to the System Status tile: one word for the whole
   rack. Derived from the rack's own fault plus its modules' health, so a rack
   with a dead module reads Fault even before the fault record is inspected.
   -------------------------------------------------------------------------- */

type RackStatus = 'Normal' | 'Warning' | 'Fault';

function deriveRackStatus(rack: RackTelemetry): RackStatus {
  /* Primary source is the rack's own fault record — the same field the Fault
     status panel and the rack chips read. Aggregating module health here
     instead would let the headline say "Fault" while the panel beside it named
     a warning, which reads as a bug rather than as extra detail. */
  if (rack.fault) return rack.fault.severity === 'fault' ? 'Fault' : 'Warning';

  /* Fallback only: a rack carrying an unhealthy module but no fault record
     must still not report Normal. */
  if (rack.modules.some((m) => m.health === 'Fault' || m.health === 'Offline')) return 'Fault';
  if (rack.modules.some((m) => m.health === 'Warning')) return 'Warning';

  return 'Normal';
}

const RACK_STATUS_STYLE: Record<
  RackStatus,
  { icon: typeof IconCheckCircle; text: string; badge: 'ok' | 'warn' | 'crit'; detail: string }
> = {
  Normal: {
    icon: IconCheckCircle,
    text: 'text-ok-ink',
    badge: 'ok',
    detail: 'All modules reporting within configured limits.',
  },
  Warning: {
    icon: IconWarning,
    text: 'text-warn-ink',
    badge: 'warn',
    detail: 'One or more readings are outside the nominal band.',
  },
  Fault: {
    icon: IconFault,
    text: 'text-crit-ink',
    badge: 'crit',
    detail: 'A protection has tripped or a module has stopped reporting.',
  },
};

interface RackOverviewProps {
  deviceId?: string;
  onModuleSelect?: (moduleId: string) => void;
}

export function RackOverview({ deviceId, onModuleSelect }: RackOverviewProps) {
  const telemetry = useMemo(() => getSystemTelemetry(deviceId || 'default'), [deviceId]);

  const rackOptions: Rack[] = useMemo(
    () =>
      telemetry.racks.map((rack) => ({
        id: rack.id,
        name: rack.name,
        meta: operatingStateLabel(rack.state),
      })),
    [telemetry],
  );

  const [selectedId, setSelectedId] = useState(rackOptions[0].id);
  const rack = telemetry.racks.find((r) => r.id === selectedId) ?? telemetry.racks[0];
  const selectedOption = rackOptions.find((r) => r.id === selectedId) ?? rackOptions[0];

  const rackStatus = deriveRackStatus(rack);
  const statusStyle = RACK_STATUS_STYLE[rackStatus];
  const StatusIcon = statusStyle.icon;

  return (
    <div>
      <PageHeader
        eyebrow="Rack drill-down"
        title="Rack overview"
        description={`Electrical, energy and diagnostic state for the selected rack${
          deviceId ? ` on device ${deviceId}` : ''
        }.`}
        actions={
          <RackSelector
            racks={rackOptions}
            selectedRack={selectedOption}
            onSelect={(option) => setSelectedId(option.id)}
          />
        }
      />

      {/* ---------------------------------------------- Rack comparison strip
          Answers "which rack is affected" before anything is selected. */}
      <div
        role="group"
        aria-label="Select a rack"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"
      >
        {telemetry.racks.map((candidate) => (
          <RackChip
            key={candidate.id}
            rack={candidate}
            selected={candidate.id === rack.id}
            onSelect={() => setSelectedId(candidate.id)}
          />
        ))}
      </div>

      {/* ---------------------------------------------- State & outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        <Panel className="lg:col-span-5 flex flex-col">
          <PanelHeader
            title={`${rack.name} · status`}
            icon={IconRack}
            actions={
              <Badge tone={statusStyle.badge} size="xs">
                {rackStatus}
              </Badge>
            }
            divided
          />

          {/* Rack status — the rack-level counterpart to the System Status tile */}
          <div className="flex items-start gap-3 pb-4 mb-4 border-b border-line">
            <StatusIcon size={20} className={`${statusStyle.text} shrink-0 mt-0.5`} />
            <div className="min-w-0">
              <p className="label-technical mb-1">Rack status</p>
              <p
                className={`text-[19px] leading-none font-semibold tracking-[-0.015em] ${statusStyle.text}`}
                aria-live="polite"
              >
                {rackStatus}
              </p>
              <p className="mt-1.5 text-[12px] text-ink-2 leading-relaxed">
                {statusStyle.detail}
              </p>
            </div>
          </div>

          <OperatingStatePanel
            state={rack.state}
            current={rack.current}
            power={rack.power}
            className="mb-5"
          />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 mt-auto pt-4 border-t border-line">
            <div>
              <dt className="label-technical mb-1.5">Output voltage</dt>
              <dd className="data-technical text-[15px] font-medium text-ink">
                {rack.outputVoltage > 0 ? rack.outputVoltage.toFixed(1) : '0.0'}
                <span className="text-[11px] text-ink-4 ml-0.5">V</span>
              </dd>
            </div>
            <div>
              <dt className="label-technical mb-1.5">Contactor</dt>
              <dd className="flex items-center gap-2">
                <IconContactor
                  size={15}
                  className={rack.contactorClosed ? 'text-ok-ink' : 'text-idle-ink'}
                />
                <span
                  className={`text-[13px] font-medium ${
                    rack.contactorClosed ? 'text-ok-ink' : 'text-idle-ink'
                  }`}
                >
                  {rack.contactorClosed ? 'Closed' : 'Open'}
                </span>
              </dd>
            </div>
          </dl>
        </Panel>

        {/* Fault status — always present so the layout does not shift on clear */}
        <Panel
          tone={rack.fault ? (rack.fault.severity === 'fault' ? 'crit' : 'warn') : 'default'}
          className="lg:col-span-7 flex flex-col"
        >
          <PanelHeader
            title="Fault status"
            icon={IconImbalance}
            actions={
              rack.fault ? (
                <Badge tone={rack.fault.severity === 'fault' ? 'crit' : 'warn'} size="xs">
                  {rack.fault.code}
                </Badge>
              ) : (
                <Badge tone="ok" size="xs">
                  Clear
                </Badge>
              )
            }
            divided
          />

          {rack.fault ? (
            <>
              {/* Severity word and fault name always travel together */}
              <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span
                  className={`label-technical !text-[10px] ${
                    rack.fault.severity === 'fault' ? 'text-crit-ink' : 'text-warn-ink'
                  }`}
                >
                  {rack.fault.severity === 'fault' ? 'Fault' : 'Warning'}
                </span>
                <span
                  className={`text-[17px] font-semibold tracking-[-0.015em] ${
                    rack.fault.severity === 'fault' ? 'text-crit-ink' : 'text-warn-ink'
                  }`}
                >
                  {rack.fault.name}
                </span>
              </p>

              {rack.fault.detail && (
                <p className="mt-2 text-[12.5px] text-ink-2 leading-relaxed">
                  {rack.fault.detail}
                </p>
              )}

              <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-auto pt-4 border-t border-black/[0.06]">
                <div>
                  <dt className="label-technical mb-1">Fault type</dt>
                  <dd className="text-[12.5px] font-medium text-ink">{rack.fault.name}</dd>
                </div>
                <div>
                  <dt className="label-technical mb-1">Code</dt>
                  <dd className="data-technical text-[12.5px] text-ink-2">{rack.fault.code}</dd>
                </div>
                <div>
                  <dt className="label-technical mb-1">Origin</dt>
                  <dd className="data-technical text-[12.5px] text-ink-2">{rack.fault.source}</dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center py-2">
              <FaultInline fault={null} healthyLabel="No active fault on this rack" />
              <p className="mt-2 text-[12px] text-ink-4">
                All protections armed. Cell, thermal and communication limits are within
                configuration.
              </p>
            </div>
          )}
        </Panel>
      </div>

      {/* ---------------------------------------------- Primary rack metrics */}
      <Panel flush className="overflow-hidden mb-5">
        <div className="px-5 pt-4">
          <PanelHeader
            title={`${rack.name} · measurements`}
            icon={IconVoltage}
            meta="live"
            divided
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line">
          <MetricCell
            label="Rack voltage"
            value={rack.voltage.toFixed(1)}
            unit="V"
            icon={IconVoltage}
          />
          <MetricCell
            label="Rack current"
            value={Math.abs(rack.current).toFixed(1)}
            unit="A"
            icon={IconCurrent}
            hint={operatingStateLabel(rack.state)}
          />
          <MetricCell
            label="Rack power"
            value={Math.abs(rack.power).toFixed(2)}
            unit="kW"
            icon={IconPower}
          />
          <MetricCell
            label="Cycle count"
            value={rack.cycleCount}
            icon={IconCycle}
            hint="equivalent full cycles"
          />
          <MetricCell
            label="Rack SOC"
            value={rack.soc.toFixed(1)}
            unit="%"
            icon={IconCharge}
            tone={rack.soc < 20 ? 'warn' : 'default'}
          />
          <MetricCell
            label="Rack SOH"
            value={rack.soh.toFixed(1)}
            unit="%"
            icon={IconHealth}
            tone={rack.soh < 80 ? 'warn' : 'default'}
          />
          <MetricCell
            label="Daily charged"
            value={rack.dailyChargedKwh.toFixed(1)}
            unit="kWh"
            icon={IconEnergy}
            hint="since midnight"
          />
          <MetricCell
            label="Daily discharged"
            value={rack.dailyDischargedKwh.toFixed(1)}
            unit="kWh"
            icon={IconEnergy}
            hint="since midnight"
          />
        </div>
      </Panel>

      {/* ---------------------------------------------- Cell extremes */}
      <RackExtremes extremes={rack.extremes} rackName={rack.name} className="mb-5" />

      {/* ---------------------------------------------- Module navigator
          Identity only — no per-module telemetry. See the note at the top. */}
      <Panel flush className="overflow-hidden">
        <div className="px-5 pt-4">
          <PanelHeader
            title="Modules"
            icon={IconModule}
            meta={`${rack.modules.length} in rack`}
            divided
          />
        </div>
        <ModuleNavigator modules={rack.modules} onSelect={onModuleSelect} />
      </Panel>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   RackChip — one rack in the comparison strip.
   -------------------------------------------------------------------------- */

function RackChip({
  rack,
  selected,
  onSelect,
}: {
  rack: RackTelemetry;
  selected: boolean;
  onSelect: () => void;
}) {
  const tone = rack.fault
    ? rack.fault.severity === 'fault'
      ? 'crit'
      : 'warn'
    : 'ok';

  const border = selected
    ? 'border-ink-4 shadow-[var(--shadow-e2)]'
    : 'border-line hover:border-line-2';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative text-left bg-surface border rounded-[10px] px-4 py-3.5 cursor-pointer
        transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-precise)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
        ${border}`}
    >
      {selected && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-3 bottom-3 w-[2.5px] rounded-r-full bg-brand"
        />
      )}

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="data-technical text-[13px] font-semibold text-ink">{rack.name}</span>
        <LiveDot tone={tone} size={6} live={!rack.fault} />
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="data-technical text-[17px] font-medium text-ink leading-none">
          {rack.soc.toFixed(1)}
        </span>
        <span className="text-[11px] text-ink-4">% SOC</span>
      </div>

      <OperatingStateBadge state={rack.state} size="xs" />
    </button>
  );
}

/* -----------------------------------------------------------------------------
   MetricCell — one figure inside the measurements grid.
   -------------------------------------------------------------------------- */

function MetricCell({
  label,
  value,
  unit,
  icon,
  tone = 'default',
  hint,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  tone?: 'default' | 'ok' | 'warn' | 'crit' | 'info';
  hint?: string;
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <Readout label={label} value={value} unit={unit} icon={icon} tone={tone} hint={hint} />
    </div>
  );
}

/* -----------------------------------------------------------------------------
   ModuleNavigator

   A way into each module's cells, and nothing more.

   The previous version of this screen listed voltage, temperature, SOC, SOH,
   spread and health for all twelve modules. The company's review asked for that
   to go: the rack panels above already carry those figures at rack scope, and
   the cell-extremes matrix already names the specific module behind every
   outlier — so twelve rows of per-module telemetry restated what was on screen
   and pushed the rack readings out of view.

   What survives is the navigation the rest of the app depends on, and nothing
   else: a module's name and a way into its cells. No health dot, no status
   colouring, no per-module state of any kind — where a module needs attention
   is stated by the Rack status and Fault status panels and by the cell-extremes
   matrix, all of which name the module directly.
   -------------------------------------------------------------------------- */

function ModuleNavigator({
  modules,
  onSelect,
}: {
  modules: RackModule[];
  onSelect?: (moduleId: string) => void;
}) {
  return (
    <div className="p-4 sm:p-5">
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {modules.map((module) => (
          <li key={module.id}>
            <button
              type="button"
              onClick={() => onSelect?.(module.id)}
              disabled={!onSelect}
              aria-label={`Open cells for ${module.name}`}
              className={`
                group w-full h-10 px-3 inline-flex items-center gap-2
                rounded-md border border-line bg-surface text-left
                transition-[border-color,background-color] duration-150
                [transition-timing-function:var(--ease-precise)]
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
                ${
                  onSelect
                    ? 'cursor-pointer hover:border-line-3 hover:bg-surface-2'
                    : 'cursor-default'
                }
              `}
            >
              <span className="data-technical text-[12.5px] font-medium text-ink truncate">
                {module.name}
              </span>

              {onSelect && (
                <IconChevronRight
                  size={12}
                  className="ml-auto shrink-0 text-ink-4 opacity-0
                    group-hover:opacity-100 group-focus-visible:opacity-100
                    transition-opacity duration-150"
                />
              )}
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11.5px] text-ink-4 leading-relaxed">
        Select a module to open its cell detail. Per-module condition is covered by the rack
        status, fault status and cell extremes above.
      </p>
    </div>
  );
}
