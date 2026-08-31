import { useMemo, useState } from 'react';
import AlertCard, { AlertItem } from './../AlertCard';
import { getSystemTelemetry } from '../../data/bmsTelemetry';
import { Panel } from '../ui/Panel';
import { Readout } from '../ui/Metric';
import PageHeader from '../PageHeader';
import { IconFault, IconWarning, IconInfo } from '../icons';

/* Informational events have no fault record behind them, so they stay static.
   Faults and warnings are derived from the telemetry model, which keeps the
   names and codes here identical to the fault banner and the rack screen. */
const INFO_EVENTS: AlertItem[] = [
  {
    type: 'info',
    message: 'Realtime connection established',
    time: 'Just now',
    source: 'Gateway · CAN-A',
    code: 'LINK-0001',
    detail: 'Telemetry stream resumed at a 1 s sample interval. No frames dropped since resync.',
  },
  {
    type: 'info',
    message: 'Firmware update completed',
    time: '2 days ago',
    source: 'Device · controller',
    code: 'FW-2143',
    detail:
      'Controller updated to v2.14.3. Protection thresholds and calibration data were preserved through the update.',
  },
];

/** Relative age of a fault, for the log's timestamp column. */
function relativeAge(iso: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

const FILTERS = [
  { id: 'all', label: 'All events' },
  { id: 'fault', label: 'Faults' },
  { id: 'warning', label: 'Warnings' },
  { id: 'info', label: 'Info' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

interface BmsAlertsProps {
  deviceId?: string;
}

/* =============================================================================
   BmsAlerts

   A device event log. Severity counts sit above the list so the reader knows
   what they are walking into, and act as the filter — the summary and the
   control are the same object, which removes a redundant row of chips.
   ========================================================================== */

export function BmsAlerts({ deviceId }: BmsAlertsProps) {
  const [filter, setFilter] = useState<FilterId>('all');

  const alertsData = useMemo<AlertItem[]>(() => {
    const telemetry = getSystemTelemetry(deviceId || 'default');
    const faults: AlertItem[] = telemetry.racks
      .filter((rack) => rack.fault)
      .map((rack) => {
        const fault = rack.fault!;
        return {
          type: fault.severity,
          message: fault.name,
          time: relativeAge(fault.raisedAt),
          source: fault.source,
          code: fault.code,
          detail: fault.detail,
        };
      });

    // Faults first, then warnings, then the informational tail.
    return [
      ...faults.filter((f) => f.type === 'fault'),
      ...faults.filter((f) => f.type === 'warning'),
      ...INFO_EVENTS,
    ];
  }, [deviceId]);

  const counts = useMemo(
    () => ({
      all: alertsData.length,
      fault: alertsData.filter((a) => a.type === 'fault').length,
      warning: alertsData.filter((a) => a.type === 'warning').length,
      info: alertsData.filter((a) => a.type === 'info').length,
    }),
    [alertsData],
  );

  const visible = useMemo(
    () => (filter === 'all' ? alertsData : alertsData.filter((a) => a.type === filter)),
    [filter, alertsData],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Event log"
        title="Alerts"
        description={`Faults, warnings and informational events recorded for device ${
          deviceId || 'BMS-101'
        }, newest first.`}
      />

      {/* Severity summary — doubles as the filter */}
      <Panel flush className="overflow-hidden mb-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
          <SeverityTile
            label="All events"
            count={counts.all}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <SeverityTile
            label="Faults"
            count={counts.fault}
            tone="crit"
            icon={IconFault}
            active={filter === 'fault'}
            onClick={() => setFilter('fault')}
          />
          <SeverityTile
            label="Warnings"
            count={counts.warning}
            tone="warn"
            icon={IconWarning}
            active={filter === 'warning'}
            onClick={() => setFilter('warning')}
          />
          <SeverityTile
            label="Info"
            count={counts.info}
            tone="info"
            icon={IconInfo}
            active={filter === 'info'}
            onClick={() => setFilter('info')}
          />
        </div>
      </Panel>

      <AlertCard
        alerts={visible}
        title={FILTERS.find((f) => f.id === filter)!.label}
        className="min-h-[420px]"
      />
    </div>
  );
}

function SeverityTile({
  label,
  count,
  tone = 'default',
  icon,
  active,
  onClick,
}: {
  label: string;
  count: number;
  tone?: 'default' | 'crit' | 'warn' | 'info';
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        relative text-left px-5 py-4 cursor-pointer
        transition-colors duration-150 [transition-timing-function:var(--ease-precise)]
        focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand
        ${active ? 'bg-surface-2' : 'bg-surface hover:bg-surface-2'}
      `}
    >
      {active && (
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-brand" />
      )}
      <Readout
        label={label}
        value={count}
        icon={icon}
        tone={count === 0 ? 'default' : tone}
        size="md"
      />
    </button>
  );
}
