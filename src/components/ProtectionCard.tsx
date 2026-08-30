import React from 'react';
import { Panel, PanelHeader } from './ui/Panel';
import { Badge, LiveDot } from './ui/Badge';
import { IconProtection, IconContactor } from './icons';

export interface ProtectionItem {
  label: string;
  /** 'armed' — watching and clear. 'tripped' — actively protecting. */
  state: 'armed' | 'tripped' | 'disabled';
}

export interface ProtectionCardProps {
  state: string;
  /** The protection set the BMS is enforcing. */
  protections?: ProtectionItem[];
  /** Insulation resistance in kΩ/V, if reported. */
  insulation?: number;
  className?: string;
}

const DEFAULT_PROTECTIONS: ProtectionItem[] = [
  { label: 'Over-voltage', state: 'armed' },
  { label: 'Under-voltage', state: 'armed' },
  { label: 'Over-temp', state: 'armed' },
  { label: 'Over-current', state: 'armed' },
  { label: 'Short circuit', state: 'armed' },
  { label: 'Isolation', state: 'armed' },
];

/**
 * ProtectionCard
 *
 * What the BMS is currently enforcing. Contactor state leads because it answers
 * the operator's real question — is the pack on the bus — and the protection
 * set below it is listed flat rather than hidden behind a summary, since
 * "protections OK" is exactly the claim an engineer will want to verify item by
 * item during a fault investigation.
 */
export default function ProtectionCard({
  state,
  protections = DEFAULT_PROTECTIONS,
  insulation,
  className = '',
}: ProtectionCardProps) {
  const isConnected = state.toLowerCase() === 'connected';
  const trippedCount = protections.filter((p) => p.state === 'tripped').length;

  return (
    <Panel className={`flex flex-col ${className}`}>
      <PanelHeader
        title="Protection"
        icon={IconProtection}
        actions={
          trippedCount > 0 ? (
            <Badge tone="crit" size="xs">
              {trippedCount} tripped
            </Badge>
          ) : (
            <Badge tone="ok" size="xs">
              All armed
            </Badge>
          )
        }
      />

      {/* Contactor */}
      <div
        className={`flex items-center gap-3 px-3.5 py-3 rounded-md border mb-4 ${
          isConnected ? 'bg-ok-surface border-ok-line' : 'bg-crit-surface border-crit-line'
        }`}
      >
        <IconContactor
          size={20}
          className={isConnected ? 'text-ok-ink shrink-0' : 'text-crit-ink shrink-0'}
        />
        <div className="min-w-0 flex-1">
          <p
            className={`text-[13.5px] font-semibold leading-tight ${
              isConnected ? 'text-ok-ink' : 'text-crit-ink'
            }`}
          >
            {isConnected ? 'Contactors closed' : 'Contactors open'}
          </p>
          <p className="text-[11.5px] text-ink-3 mt-0.5">
            {isConnected ? 'Pack connected to DC bus' : 'Pack isolated from DC bus'}
          </p>
        </div>
        <LiveDot tone={isConnected ? 'ok' : 'crit'} size={7} live={isConnected} />
      </div>

      {/* Protection set */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-0 mt-auto">
        {protections.map((protection) => (
          <li
            key={protection.label}
            className="flex items-center justify-between gap-2 py-1.5 border-b border-line last:border-b-0"
          >
            <span className="text-[12px] text-ink-2 truncate">{protection.label}</span>
            <span className="shrink-0">
              {protection.state === 'tripped' ? (
                <span className="data-technical text-[10px] font-semibold uppercase tracking-wider text-crit-ink">
                  Tripped
                </span>
              ) : protection.state === 'disabled' ? (
                <span className="data-technical text-[10px] uppercase tracking-wider text-ink-4">
                  Off
                </span>
              ) : (
                <LiveDot tone="ok" size={5} />
              )}
            </span>
          </li>
        ))}
      </ul>

      {typeof insulation === 'number' && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
          <span className="label-technical">Insulation</span>
          <span className="data-technical text-[12px] text-ink">
            {insulation}
            <span className="text-ink-4 ml-0.5">kΩ/V</span>
          </span>
        </div>
      )}
    </Panel>
  );
}
