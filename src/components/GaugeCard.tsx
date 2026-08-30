import React from 'react';
import { Panel, PanelHeader } from './ui/Panel';
import Gauge from './ui/Gauge';

export interface GaugeCardProps {
  title: string;
  percentage: number;
  /** Legacy text-colour class from the previous system; superseded by `tone`. */
  color?: string;
  tone?: 'ok' | 'warn' | 'crit' | 'info' | 'brand';
  unit?: string;
  /** Line beneath the arc giving the number context. */
  caption?: React.ReactNode;
  /** Draws a reference tick on the arc, e.g. a reserve floor. */
  threshold?: number;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  className?: string;
}

/**
 * GaugeCard
 *
 * An arc instrument on its own surface. Tone is derived from the reading when
 * the caller does not force one, so a state of charge that falls under 20%
 * turns amber without every call site having to know the threshold.
 */
export default function GaugeCard({
  title,
  percentage,
  tone,
  unit = '%',
  caption,
  threshold,
  icon,
  className = '',
}: GaugeCardProps) {
  const resolved = tone ?? (percentage < 15 ? 'crit' : percentage < 25 ? 'warn' : 'brand');

  return (
    <Panel className={`flex flex-col ${className}`}>
      <PanelHeader title={title} icon={icon} />
      <div className="flex-1 flex items-center justify-center py-1">
        <Gauge
          value={percentage}
          label={unit === '%' ? 'of capacity' : unit}
          unit={unit}
          tone={resolved}
          threshold={threshold}
          size={124}
          caption={caption}
        />
      </div>
    </Panel>
  );
}
