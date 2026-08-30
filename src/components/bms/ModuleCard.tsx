import CommunicationBadge from './CommunicationBadge';
import HealthBadge from './HealthBadge';
import ImbalanceAlert from './ImbalanceAlert';
import { Meter } from '../ui/Metric';
import { IconVoltage, IconTemperature, IconChevronRight } from '../icons';

export interface BmsModule {
  id: string;
  name: string;
  voltage: number;
  temperature: number;
  communication: string;
  health: string;
  deltaV: number | null;
}

interface ModuleCardProps {
  module: BmsModule;
  isHighestImbalance: boolean;
  onSelect?: () => void;
  /** Voltage span across the rack, used to position this module's meter. */
  voltageRange?: [number, number];
  /** Thermal span across the rack. */
  tempRange?: [number, number];
}

const TONE_BORDER: Record<string, string> = {
  ok: 'border-line',
  warn: 'border-warn-line',
  crit: 'border-crit-line',
  idle: 'border-line-2',
};

/**
 * ModuleCard
 *
 * Reads as a piece of hardware. The two vitals that decide whether an engineer
 * opens a module — pack voltage and hottest probe — are shown as values *and*
 * as their position within the rack's spread, so an outlier is visible from the
 * bar alone before any digit is read.
 *
 * A lost CAN link greys the whole card: stale numbers must not look live.
 */
export default function ModuleCard({
  module,
  isHighestImbalance,
  onSelect,
  voltageRange,
  tempRange,
}: ModuleCardProps) {
  const isOffline = module.communication !== 'Active';
  const health = module.health.toLowerCase();
  const tone = health === 'warning' ? 'warn' : health === 'fault' ? 'crit' : isOffline ? 'idle' : 'ok';

  const [vMin, vMax] = voltageRange ?? [module.voltage - 1, module.voltage + 1];
  const [tMin, tMax] = tempRange ?? [20, 50];

  const tempTone = module.temperature > 45 ? 'crit' : module.temperature >= 35 ? 'warn' : 'ok';

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`
        group relative flex flex-col bg-surface border rounded-[10px] p-4
        shadow-[var(--shadow-e1)]
        transition-[border-color,box-shadow] duration-150
        [transition-timing-function:var(--ease-precise)]
        ${onSelect ? 'cursor-pointer hover:shadow-[var(--shadow-e2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand' : ''}
        ${isHighestImbalance ? 'border-warn-line bg-warn-surface/40' : TONE_BORDER[tone]}
        ${onSelect ? 'hover:border-line-3' : ''}
        ${isOffline ? 'opacity-70' : ''}
      `}
    >
      {/* Identity */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="data-technical text-[13px] font-semibold text-ink truncate">
          {module.name}
        </h3>
        <HealthBadge status={module.health} />
      </div>

      {/* Vitals */}
      <div className="space-y-3.5 mb-4">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="flex items-center gap-1.5">
              <IconVoltage size={11} className="text-ink-4" />
              <span className="label-technical">Voltage</span>
            </span>
            <span className="data-technical text-[16px] font-medium text-ink leading-none">
              {module.voltage.toFixed(2)}
              <span className="text-[11px] text-ink-4 ml-0.5">V</span>
            </span>
          </div>
          <Meter
            value={module.voltage}
            min={vMin}
            max={vMax}
            tone={isOffline ? 'neutral' : 'ok'}
            height={3}
            label={`${module.name} voltage`}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="flex items-center gap-1.5">
              <IconTemperature size={11} className="text-ink-4" />
              <span className="label-technical">Peak temp</span>
            </span>
            <span
              className={`data-technical text-[16px] font-medium leading-none ${
                tempTone === 'crit'
                  ? 'text-crit-ink'
                  : tempTone === 'warn'
                    ? 'text-warn-ink'
                    : 'text-ink'
              }`}
            >
              {module.temperature.toFixed(1)}
              <span className="text-[11px] text-ink-4 ml-0.5">°C</span>
            </span>
          </div>
          <Meter
            value={module.temperature}
            min={tMin}
            max={tMax}
            tone={isOffline ? 'neutral' : tempTone}
            height={3}
            label={`${module.name} temperature`}
          />
        </div>
      </div>

      {isHighestImbalance && module.deltaV && (
        <div className="mt-4 mb-1">
          <ImbalanceAlert deltaV={module.deltaV} />
        </div>
      )}

      {/* Link state — pinned to the card floor so a row of cards of differing
          content height still aligns its footers. */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-line">
        <CommunicationBadge active={module.communication === 'Active'} />
        {onSelect && (
          <span
            className="flex items-center gap-1 text-[11px] font-medium text-ink-4
              opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
              transition-opacity duration-150"
          >
            Cells
            <IconChevronRight size={11} />
          </span>
        )}
      </div>
    </div>
  );
}
