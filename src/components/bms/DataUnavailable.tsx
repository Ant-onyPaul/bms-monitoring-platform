import React from 'react';
import { Panel, PanelHeader } from '../ui/Panel';
import Button from '../ui/Button';
import { IconEye, IconInfo } from '../icons';

type IconType = React.ComponentType<{ size?: number | string; className?: string }>;

/* -----------------------------------------------------------------------------
   DataUnavailable

   What a section shows when the backend does not supply its data yet. It says
   so plainly and names what is needed, instead of drawing a plausible-looking
   card from nothing. `compact` fits a single card slot inside a grid; the full
   variant fills a whole tab.
   -------------------------------------------------------------------------- */

interface DataUnavailableProps {
  title: string;
  icon?: IconType;
  /** One sentence on what is missing. */
  message?: string;
  /** Endpoint and fields the backend would need to provide. */
  requirement?: { endpoint: string; fields: string };
  /** Offers the layout preview with simulated data. */
  onPreview?: () => void;
  compact?: boolean;
  className?: string;
}

export function DataUnavailable({
  title,
  icon = IconInfo,
  message = 'Not provided by the backend yet.',
  requirement,
  onPreview,
  compact = false,
  className = '',
}: DataUnavailableProps) {
  const Icon = icon;

  if (compact) {
    return (
      <Panel className={`flex flex-col ${className}`}>
        <PanelHeader title={title} icon={icon} />
        <div
          className="flex-1 min-h-[120px] rounded-md border border-dashed border-line-2 bg-surface-2
            blueprint-grid flex flex-col items-center justify-center gap-1.5 text-center px-4 py-5"
        >
          <p className="text-[12.5px] font-medium text-ink-2">Not reported</p>
          <p className="text-[11.5px] text-ink-4 max-w-[240px] leading-relaxed">{message}</p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className={className}>
      <div
        className="rounded-md border border-dashed border-line-2 bg-surface-2 blueprint-grid
          flex flex-col items-center justify-center gap-2.5 text-center px-6 py-14"
      >
        <Icon size={22} className="text-ink-4" />
        <p className="text-[15px] font-semibold text-ink-2">{title}</p>
        <p className="text-[12.5px] text-ink-3 max-w-md leading-relaxed">{message}</p>

        {requirement && (
          <div className="mt-2 max-w-lg text-left rounded-md border border-line bg-surface px-4 py-3">
            <p className="label-technical mb-1.5">Needed from the backend</p>
            <p className="data-technical text-[12px] text-ink-2 mb-1.5">{requirement.endpoint}</p>
            <p className="text-[11.5px] text-ink-3 leading-relaxed">{requirement.fields}</p>
          </div>
        )}

        {onPreview && (
          <Button size="sm" variant="secondary" icon={IconEye} onClick={onPreview} className="mt-3">
            Preview layout with demo data
          </Button>
        )}
      </div>
    </Panel>
  );
}

export default DataUnavailable;
