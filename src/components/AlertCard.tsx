import React, { useState } from 'react';
import { Panel, PanelHeader } from './ui/Panel';
import { Badge, Tone } from './ui/Badge';
import { IconWarning, IconFault, IconInfo, IconChevronDown, IconCheckCircle } from './icons';

/* -----------------------------------------------------------------------------
   AlertCard

   An event log, not a notification feed. Rows are scannable at severity level
   first — a coloured spine on the left edge means the eye can find the faults
   without reading a word — and expand in place to reveal source, code and
   recommended action.

   Accepts the original `{ type, message, time }` shape; `source`, `code` and
   `detail` are optional enrichments.
   -------------------------------------------------------------------------- */

export interface AlertItem {
  type: string; // 'fault' | 'warning' | 'info'
  message: string;
  time: string;
  /** Where the event originated, e.g. "Rack 1 · Module 03". */
  source?: string;
  /** Machine code, e.g. "OV-2101". */
  code?: string;
  /** Longer explanation revealed on expansion. */
  detail?: string;
}

const SEVERITY: Record<
  string,
  { tone: Tone; icon: React.ComponentType<any>; label: string; spine: string; iconColor: string }
> = {
  fault: {
    tone: 'crit',
    icon: IconFault,
    label: 'Fault',
    spine: 'bg-crit',
    iconColor: 'text-crit',
  },
  warning: {
    tone: 'warn',
    icon: IconWarning,
    label: 'Warning',
    spine: 'bg-warn',
    iconColor: 'text-warn',
  },
  info: {
    tone: 'info',
    icon: IconInfo,
    label: 'Info',
    spine: 'bg-info',
    iconColor: 'text-info',
  },
};

const resolve = (type: string) => SEVERITY[type?.toLowerCase()] ?? SEVERITY.info;

export interface AlertCardProps {
  alerts: AlertItem[];
  title?: string;
  /** Renders each row as expandable. */
  expandable?: boolean;
  /** Trailing control in the header. */
  action?: React.ReactNode;
  className?: string;
}

export default function AlertCard({
  alerts,
  title = 'Recent alerts',
  expandable = true,
  action,
  className = '',
}: AlertCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const activeCount = alerts.filter((a) => a.type?.toLowerCase() !== 'info').length;

  return (
    <Panel flush className={`flex flex-col overflow-hidden ${className}`}>
      <div className="px-5 pt-4">
        <PanelHeader
          title={title}
          meta={activeCount > 0 ? `${activeCount} active` : undefined}
          actions={action}
          divided
        />
      </div>

      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center">
          <IconCheckCircle size={22} className="text-ok mb-2.5" />
          <p className="text-[13px] font-medium text-ink-2">No active alerts</p>
          <p className="mt-1 text-[12px] text-ink-4">All monitored systems are within limits.</p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto scrollbar-fine divide-y divide-line">
          {alerts.map((alert, index) => {
            const severity = resolve(alert.type);
            const Icon = severity.icon;
            const isExpanded = expandedIndex === index;
            const canExpand = expandable && Boolean(alert.detail || alert.source || alert.code);

            return (
              <li key={`${alert.message}-${index}`} className="relative">
                {/* Severity spine */}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 bottom-0 w-[3px] ${severity.spine}`}
                />

                <div
                  role={canExpand ? 'button' : undefined}
                  tabIndex={canExpand ? 0 : undefined}
                  aria-expanded={canExpand ? isExpanded : undefined}
                  onClick={() => canExpand && setExpandedIndex(isExpanded ? null : index)}
                  onKeyDown={(e) => {
                    if (canExpand && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setExpandedIndex(isExpanded ? null : index);
                    }
                  }}
                  className={`
                    pl-5 pr-4 py-3.5 transition-colors duration-100
                    ${canExpand ? 'cursor-pointer hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={15} className={`${severity.iconColor} shrink-0 mt-0.5`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13.5px] font-medium text-ink leading-snug">
                          {alert.message}
                        </p>
                        <span className="data-technical text-[11px] text-ink-4 shrink-0 pt-0.5">
                          {alert.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge tone={severity.tone} size="xs">
                          {severity.label}
                        </Badge>
                        {alert.source && (
                          <span className="data-technical text-[11px] text-ink-4 truncate">
                            {alert.source}
                          </span>
                        )}
                        {alert.code && (
                          <span className="data-technical text-[11px] text-ink-4">
                            {alert.code}
                          </span>
                        )}
                        {canExpand && (
                          <IconChevronDown
                            size={13}
                            className={`ml-auto shrink-0 text-ink-4 transition-transform duration-200
                              [transition-timing-function:var(--ease-precise)]
                              ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        )}
                      </div>

                      {isExpanded && alert.detail && (
                        <p className="mt-3 pt-3 border-t border-line text-[12.5px] leading-relaxed text-ink-2 animate-fade-in">
                          {alert.detail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
