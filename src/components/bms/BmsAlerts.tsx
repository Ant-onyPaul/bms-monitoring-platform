import { useMemo, useState } from 'react';
import AlertCard, { AlertItem } from './../AlertCard';
import { Panel } from '../ui/Panel';
import { Readout } from '../ui/Metric';
import PageHeader from '../PageHeader';
import { IconFault, IconWarning, IconInfo } from '../icons';

// Mock Data
const alertsData: AlertItem[] = [
  {
    type: 'warning',
    message: 'Module 3 Temperature High',
    time: '2 minutes ago',
    source: 'Rack 1 · Module 03',
    code: 'OT-1140',
    detail:
      'NTC 4 reported 38.5 °C, 3.5 °C above the module mean. Airflow at the rack inlet should be checked before the next charge cycle.',
  },
  {
    type: 'fault',
    message: 'Cell 12 Voltage Low',
    time: '15 minutes ago',
    source: 'Rack 1 · Module 01 · Cell 12',
    code: 'UV-2101',
    detail:
      'Cell held 3,420 mV under load, 280 mV below the module mean. Balancing has been requested; if the spread persists across two cycles the cell should be flagged for replacement.',
  },
  {
    type: 'info',
    message: 'Realtime connection established',
    time: 'Just now',
    source: 'Gateway · CAN-A',
    code: 'LINK-0001',
    detail: 'Telemetry stream resumed at a 1 s sample interval. No frames dropped since resync.',
  },
  {
    type: 'warning',
    message: 'SOC imbalance detected',
    time: '1 hour ago',
    source: 'Rack 2 · Module 08',
    code: 'IMB-3007',
    detail:
      'Module reported a 0.15 V spread against its rack peers. Passive balancing engaged on four cells; expected to resolve within two full cycles.',
  },
  {
    type: 'info',
    message: 'Firmware update completed',
    time: '2 days ago',
    source: 'Device · BMS-A001',
    code: 'FW-2143',
    detail:
      'Controller updated to v2.14.3. Protection thresholds and calibration data were preserved through the update.',
  },
];

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

  const counts = useMemo(
    () => ({
      all: alertsData.length,
      fault: alertsData.filter((a) => a.type === 'fault').length,
      warning: alertsData.filter((a) => a.type === 'warning').length,
      info: alertsData.filter((a) => a.type === 'info').length,
    }),
    [],
  );

  const visible = useMemo(
    () => (filter === 'all' ? alertsData : alertsData.filter((a) => a.type === filter)),
    [filter],
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
