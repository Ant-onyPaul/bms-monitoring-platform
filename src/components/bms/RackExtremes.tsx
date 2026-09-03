import React from 'react';
import { CellReading, RackExtremes as RackExtremesData } from '../../types/bms.types';
import { Panel, PanelHeader } from '../ui/Panel';
import { IconImbalance, IconVoltage, IconCharge, IconHealth, IconTemperature } from '../icons';

/* =============================================================================
   RackExtremes

   Eight readings the company asked for, presented as a measurement matrix
   rather than eight cards. Rows are the measure, columns are minimum / maximum
   / spread — so the eye runs down one column to compare, and across one row to
   understand a single measure. Eight equal cards would have supported neither.

   The spread column is not in the brief but is the number an engineer actually
   acts on: a 294 mV spread is a problem regardless of where the endpoints sit.

   Every reading carries its address. A bare "cell 12" is ambiguous across
   twelve modules, so both indices are always shown.
   ========================================================================== */

type Tone = 'default' | 'ok' | 'warn' | 'crit';

interface ExtremeRow {
  key: string;
  measure: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  unit: string;
  /** Decimal places for the value. */
  dp: number;
  min: CellReading;
  max: CellReading;
  /** Unit for the spread, where it differs (percentage points, kelvin). */
  spreadUnit: string;
  /** Above this spread the row is flagged. */
  spreadLimit: number;
  /** Which end of the range is the concerning one. */
  concern: 'min' | 'max';
}

/** Formats a cell address as e.g. "M03 · C26". */
function address(reading: CellReading) {
  return `M${String(reading.module).padStart(2, '0')} · C${String(reading.cell).padStart(2, '0')}`;
}

const TONE_TEXT: Record<Tone, string> = {
  default: 'text-ink',
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  crit: 'text-crit-ink',
};

export default function RackExtremes({
  extremes,
  rackName,
  className = '',
}: {
  extremes: RackExtremesData;
  rackName: string;
  className?: string;
}) {
  const rows: ExtremeRow[] = [
    {
      key: 'voltage',
      measure: 'Cell voltage',
      icon: IconVoltage,
      unit: 'mV',
      dp: 0,
      min: extremes.minCellVoltage,
      max: extremes.maxCellVoltage,
      spreadUnit: 'mV',
      spreadLimit: 250,
      concern: 'min',
    },
    {
      key: 'soc',
      measure: 'Cell SOC',
      icon: IconCharge,
      unit: '%',
      dp: 1,
      min: extremes.minCellSoc,
      max: extremes.maxCellSoc,
      spreadUnit: 'pt',
      spreadLimit: 8,
      concern: 'min',
    },
    {
      key: 'soh',
      measure: 'Cell SOH',
      icon: IconHealth,
      unit: '%',
      dp: 1,
      min: extremes.minCellSoh,
      max: extremes.maxCellSoh,
      spreadUnit: 'pt',
      spreadLimit: 5,
      concern: 'min',
    },
    {
      key: 'temperature',
      measure: 'Temperature',
      icon: IconTemperature,
      unit: '°C',
      dp: 1,
      min: extremes.minTemperature,
      max: extremes.maxTemperature,
      spreadUnit: 'K',
      spreadLimit: 10,
      concern: 'max',
    },
  ];

  const flagged = rows.filter((r) => r.max.value - r.min.value > r.spreadLimit).length;

  return (
    <Panel flush className={`overflow-hidden ${className}`}>
      <div className="px-5 pt-4">
        <PanelHeader
          title={`${rackName} · cell extremes`}
          icon={IconImbalance}
          meta={flagged > 0 ? `${flagged} outside limit` : 'all within limits'}
          divided
        />
      </div>

      {/* ---------------------------------------------- Matrix (sm and up) */}
      <div className="hidden sm:block overflow-x-auto scrollbar-fine">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Minimum and maximum cell readings across {rackName}, with the module and cell each
            reading came from.
          </caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="text-left px-5 py-2">
                <span className="label-technical">Measure</span>
              </th>
              <th scope="col" className="text-left px-5 py-2">
                <span className="label-technical">Minimum</span>
              </th>
              <th scope="col" className="text-left px-5 py-2">
                <span className="label-technical">Maximum</span>
              </th>
              <th scope="col" className="text-right px-5 py-2">
                <span className="label-technical">Spread</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const spread = row.max.value - row.min.value;
              const over = spread > row.spreadLimit;
              const Icon = row.icon;

              return (
                <tr key={row.key} className="border-b border-line last:border-b-0">
                  <th scope="row" className="text-left px-5 py-3.5 align-middle">
                    <span className="inline-flex items-center gap-2">
                      <Icon size={13} className="text-ink-4 shrink-0" />
                      <span className="text-[13px] font-medium text-ink whitespace-nowrap">
                        {row.measure}
                      </span>
                    </span>
                  </th>

                  <td className="px-5 py-3.5 align-middle">
                    <ExtremeValue
                      reading={row.min}
                      unit={row.unit}
                      dp={row.dp}
                      tone={over && row.concern === 'min' ? 'warn' : 'default'}
                    />
                  </td>

                  <td className="px-5 py-3.5 align-middle">
                    <ExtremeValue
                      reading={row.max}
                      unit={row.unit}
                      dp={row.dp}
                      tone={over && row.concern === 'max' ? 'warn' : 'default'}
                    />
                  </td>

                  <td className="px-5 py-3.5 align-middle text-right">
                    <span
                      className={`data-technical text-[14px] font-medium ${
                        over ? 'text-warn-ink' : 'text-ink-2'
                      }`}
                    >
                      {spread.toFixed(row.dp)}
                      <span className="text-[11px] text-ink-4 ml-0.5">{row.spreadUnit}</span>
                    </span>
                    <span className="block label-technical !text-[9.5px] mt-1">
                      limit {row.spreadLimit}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------------------------------------------- Stacked (mobile) */}
      <ul className="sm:hidden divide-y divide-line">
        {rows.map((row) => {
          const spread = row.max.value - row.min.value;
          const over = spread > row.spreadLimit;
          const Icon = row.icon;

          return (
            <li key={row.key} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="inline-flex items-center gap-2">
                  <Icon size={13} className="text-ink-4 shrink-0" />
                  <span className="text-[13px] font-medium text-ink">{row.measure}</span>
                </span>
                <span
                  className={`data-technical text-[12px] font-medium ${
                    over ? 'text-warn-ink' : 'text-ink-3'
                  }`}
                >
                  Δ{spread.toFixed(row.dp)} {row.spreadUnit}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="label-technical block mb-1.5">Minimum</span>
                  <ExtremeValue
                    reading={row.min}
                    unit={row.unit}
                    dp={row.dp}
                    tone={over && row.concern === 'min' ? 'warn' : 'default'}
                  />
                </div>
                <div>
                  <span className="label-technical block mb-1.5">Maximum</span>
                  <ExtremeValue
                    reading={row.max}
                    unit={row.unit}
                    dp={row.dp}
                    tone={over && row.concern === 'max' ? 'warn' : 'default'}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="px-5 py-3 border-t border-line text-[11.5px] text-ink-4 leading-relaxed">
        Addresses are module · cell, both 1-indexed to match hardware labelling. Spread limits are
        the configured balancing and thermal thresholds.
      </p>
    </Panel>
  );
}

/* -----------------------------------------------------------------------------
   A single extreme: the value, then the cell it came from. The address is the
   point of this screen — a reading nobody can locate is not actionable.
   -------------------------------------------------------------------------- */

function ExtremeValue({
  reading,
  unit,
  dp,
  tone = 'default',
}: {
  reading: CellReading;
  unit: string;
  dp: number;
  tone?: Tone;
}) {
  return (
    <span className="flex flex-col gap-1">
      <span className={`data-technical text-[15px] font-medium leading-none ${TONE_TEXT[tone]}`}>
        {reading.value.toFixed(dp)}
        <span className="text-[11px] text-ink-4 ml-0.5">{unit}</span>
      </span>
      <span className="data-technical text-[11px] text-ink-4">{address(reading)}</span>
    </span>
  );
}
