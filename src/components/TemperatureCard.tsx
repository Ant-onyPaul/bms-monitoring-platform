import React from 'react';
import { Panel, PanelHeader } from './ui/Panel';
import { Readout } from './ui/Metric';
import { IconTemperature } from './icons';

export interface TemperatureCardProps {
  max: number;
  min: number;
  /** Pack mean, drawn as a marker inside the spread. */
  avg?: number;
  /** Where the peak reading came from, e.g. "Rack 1 · Module 03". */
  hottestSource?: string;
  /** Operating envelope the spread is drawn against. */
  range?: [number, number];
  className?: string;
}

/**
 * TemperatureCard
 *
 * Thermal behaviour is about *spread*, not a single number: a pack running
 * 28–42 °C is healthy, one running 28–52 °C is not, and both can share the same
 * mean. This draws the min–max band inside the operating envelope with the mean
 * marked, so the shape of the distribution is the first thing read.
 */
export default function TemperatureCard({
  max,
  min,
  avg,
  hottestSource,
  range = [10, 60],
  className = '',
}: TemperatureCardProps) {
  const [floor, ceiling] = range;
  const span = ceiling - floor || 1;
  const pct = (value: number) => Math.min(100, Math.max(0, ((value - floor) / span) * 100));

  const delta = max - min;
  const tone = max >= 45 ? 'crit' : max >= 35 ? 'warn' : 'default';

  return (
    <Panel className={`flex flex-col justify-between ${className}`}>
      <PanelHeader
        title="Thermal"
        icon={IconTemperature}
        meta={`Δ${delta.toFixed(1)}°C`}
      />

      <div className="flex items-start justify-between gap-4">
        <Readout label="Peak" value={max.toFixed(1)} unit="°C" tone={tone} />
        {typeof avg === 'number' && (
          <Readout label="Mean" value={avg.toFixed(1)} unit="°C" />
        )}
        <Readout label="Low" value={min.toFixed(1)} unit="°C" align="right" />
      </div>

      {/* Spread within the operating envelope */}
      <div className="pt-6">
        <div className="relative h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <span
            aria-hidden="true"
            className={`absolute inset-y-0 rounded-full ${
              tone === 'crit' ? 'bg-crit' : tone === 'warn' ? 'bg-warn' : 'bg-ok'
            }`}
            style={{
              left: `${pct(min)}%`,
              width: `${Math.max(2, pct(max) - pct(min))}%`,
              transition: 'left 620ms var(--ease-precise), width 620ms var(--ease-precise)',
            }}
          />
        </div>

        {typeof avg === 'number' && (
          <div className="relative h-0">
            <span
              aria-hidden="true"
              className="absolute -top-[9px] w-px h-3 bg-ink"
              style={{ left: `${pct(avg)}%` }}
            />
          </div>
        )}

        <div className="flex justify-between mt-2.5">
          <span className="data-technical text-[10px] text-ink-4">{floor}°C</span>
          <span className="label-technical">Operating envelope</span>
          <span className="data-technical text-[10px] text-ink-4">{ceiling}°C</span>
        </div>
      </div>

      {hottestSource && (
        <p className="mt-3 pt-3 border-t border-line text-[11.5px] text-ink-3">
          Peak at <span className="data-technical text-ink-2">{hottestSource}</span>
        </p>
      )}
    </Panel>
  );
}
