import React from 'react';
import { Panel } from './ui/Panel';
import { Badge, LiveDot } from './ui/Badge';
import { IconCheckCircle, IconWarning, IconFault } from './icons';

export interface StatusCardProps {
  status: string;
  /** What the pack is doing right now, e.g. "Discharging". */
  mode?: string;
  /** Free-text explanation beneath the headline. */
  detail?: string;
  /** Small facts rendered along the bottom edge. */
  facts?: { label: string; value: React.ReactNode }[];
  className?: string;
}

const CONFIG = {
  normal: {
    tone: 'ok' as const,
    icon: IconCheckCircle,
    headline: 'System nominal',
    detail: 'All modules reporting within configured limits.',
    panel: 'ok' as const,
    text: 'text-ok-ink',
  },
  warning: {
    tone: 'warn' as const,
    icon: IconWarning,
    headline: 'Attention required',
    detail: 'One or more readings are outside the nominal band.',
    panel: 'warn' as const,
    text: 'text-warn-ink',
  },
  fault: {
    tone: 'crit' as const,
    icon: IconFault,
    headline: 'System fault',
    detail: 'A protection has tripped. Inspect the affected module.',
    panel: 'crit' as const,
    text: 'text-crit-ink',
  },
};

/**
 * StatusCard
 *
 * The one-glance answer to "is this pack alright?". It is deliberately the only
 * tinted panel on the overview, so the moment the page turns amber the reader
 * knows before parsing a single value.
 */
export default function StatusCard({
  status,
  mode,
  detail,
  facts,
  className = '',
}: StatusCardProps) {
  const key = status.toLowerCase() as keyof typeof CONFIG;
  const config = CONFIG[key] ?? CONFIG.fault;
  const Icon = config.icon;

  return (
    <Panel tone={config.panel} className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="label-technical">System status</span>
        {mode && (
          <Badge tone={config.tone} size="xs" dot live>
            {mode}
          </Badge>
        )}
      </div>

      <div className="flex items-start gap-3">
        <Icon size={22} className={`${config.text} shrink-0 mt-0.5`} />
        <div className="min-w-0">
          <p className={`text-[17px] font-semibold tracking-[-0.015em] ${config.text}`}>
            {config.headline}
          </p>
          <p className="mt-1 text-[12.5px] text-ink-2 leading-relaxed">
            {detail ?? config.detail}
          </p>
        </div>
      </div>

      {facts && facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mt-5 pt-4 border-t border-black/[0.06]">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="label-technical mb-1">{fact.label}</dt>
              <dd className="data-technical text-[13px] font-medium text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}
