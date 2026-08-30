import React from 'react';
import { Panel, PanelHeader } from './ui/Panel';
import { IconRefresh, IconDownload, IconHistory, IconModule } from './icons';

export interface QuickAction {
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  onClick?: () => void;
  description?: string;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: 'Refresh telemetry', icon: IconRefresh, description: 'Re-poll the gateway' },
  { label: 'Export window', icon: IconDownload, description: 'CSV of current range' },
  { label: 'Open history', icon: IconHistory, description: 'Stored intervals' },
  { label: 'Inspect modules', icon: IconModule, description: 'Rack drill-down' },
];

/**
 * QuickActionCard
 *
 * A stacked list rather than a tile grid: these are commands with consequences,
 * and a labelled row with a short description is far easier to pick correctly
 * than four equally-weighted icon squares.
 */
export default function QuickActionCard({
  actions = DEFAULT_ACTIONS,
  className = '',
}: {
  actions?: QuickAction[];
  className?: string;
}) {
  return (
    <Panel flush className={`overflow-hidden flex flex-col ${className}`}>
      <div className="px-5 pt-4">
        <PanelHeader title="Actions" divided />
      </div>

      <ul className="divide-y divide-line">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.label}>
              <button
                type="button"
                onClick={action.onClick}
                className="group w-full flex items-center gap-3 px-5 py-3 text-left cursor-pointer
                  transition-colors duration-150 hover:bg-surface-2
                  focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
              >
                <Icon
                  size={15}
                  className="shrink-0 text-ink-4 group-hover:text-brand-ink transition-colors duration-150"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-ink">{action.label}</span>
                  {action.description && (
                    <span className="block text-[11.5px] text-ink-4 mt-0.5">
                      {action.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
