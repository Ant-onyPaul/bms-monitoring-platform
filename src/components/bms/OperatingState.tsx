import { OperatingStateCode, OPERATING_STATE, operatingStateLabel } from '../../types/bms.types';
import { IconCharging, IconDischarging, IconIdle } from '../icons';

/* =============================================================================
   Operating state

   The BMS reports 0 / 1 / 2. The UI must never show the number — these
   components are the only sanctioned way to render the state, so the mapping
   lives in exactly one place.

   Colour assignment: charging is informational blue (energy arriving),
   discharging is operational green (the system delivering), idle is neutral.
   Only one of the three states is green, which keeps the accent restrained.
   ========================================================================== */

type Tone = 'info' | 'ok' | 'idle';

const STATE_STYLE: Record<
  OperatingStateCode,
  { tone: Tone; icon: typeof IconIdle; chip: string; dot: string; text: string; caption: string }
> = {
  [OPERATING_STATE.IDLE]: {
    tone: 'idle',
    icon: IconIdle,
    chip: 'bg-idle-surface border-idle-line text-idle-ink',
    dot: 'bg-idle',
    text: 'text-idle-ink',
    caption: 'Connected, no energy transfer',
  },
  [OPERATING_STATE.CHARGE]: {
    tone: 'info',
    icon: IconCharging,
    chip: 'bg-info-surface border-info-line text-info-ink',
    dot: 'bg-info',
    text: 'text-info-ink',
    caption: 'Energy flowing into the pack',
  },
  [OPERATING_STATE.DISCHARGE]: {
    tone: 'ok',
    icon: IconDischarging,
    chip: 'bg-ok-surface border-ok-line text-ok-ink',
    dot: 'bg-ok',
    text: 'text-ok-ink',
    caption: 'Energy flowing out to the bus',
  },
};

/* -----------------------------------------------------------------------------
   Badge — inline state, for headers, rack rows and table cells.
   -------------------------------------------------------------------------- */

export function OperatingStateBadge({
  state,
  size = 'sm',
  showIcon = true,
  className = '',
}: {
  state: OperatingStateCode;
  size?: 'xs' | 'sm';
  showIcon?: boolean;
  className?: string;
}) {
  const style = STATE_STYLE[state];
  const Icon = style.icon;
  const isLive = state !== OPERATING_STATE.IDLE;

  const dims =
    size === 'xs'
      ? 'h-5 px-1.5 text-[10px] gap-1 tracking-[0.06em]'
      : 'h-6 px-2 text-[11px] gap-1.5 tracking-[0.03em]';

  return (
    <span
      className={`inline-flex items-center rounded-[4px] border font-semibold whitespace-nowrap
        ${dims} ${style.chip} ${className}`}
    >
      {showIcon && <Icon size={size === 'xs' ? 11 : 12} className="shrink-0" />}
      {/* The dot only breathes while energy is actually moving. */}
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot} ${
          isLive ? 'animate-live-pulse' : ''
        }`}
        aria-hidden="true"
      />
      {operatingStateLabel(state)}
    </span>
  );
}

/* -----------------------------------------------------------------------------
   Panel — the headline state on the system and rack screens.

   Deliberately large: "what is this pack doing right now" is the first question
   an operator asks, and it should be answerable from across a room.
   -------------------------------------------------------------------------- */

export function OperatingStatePanel({
  state,
  current,
  power,
  className = '',
}: {
  state: OperatingStateCode;
  /** Signed current, A. Negative = charge. */
  current?: number;
  /** Signed power, kW. */
  power?: number;
  className?: string;
}) {
  const style = STATE_STYLE[state];
  const Icon = style.icon;
  const isLive = state !== OPERATING_STATE.IDLE;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span
        className={`relative shrink-0 inline-flex items-center justify-center w-12 h-12
          rounded-[10px] border ${style.chip}`}
      >
        <Icon size={24} />
        {isLive && (
          <span
            className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2
              border-surface ${style.dot} animate-live-pulse`}
            aria-hidden="true"
          />
        )}
      </span>

      <div className="min-w-0">
        <p
          className={`text-[22px] leading-none font-semibold tracking-[-0.02em] ${style.text}`}
          aria-live="polite"
        >
          {operatingStateLabel(state)}
        </p>
        <p className="mt-1.5 text-[12px] text-ink-3 leading-snug">{style.caption}</p>

        {/* Figures sit on their own row so a narrow column never orphans a unit
            onto a line of its own. */}
        {(typeof current === 'number' || typeof power === 'number') && (
          <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-2">
            {typeof current === 'number' && (
              <div className="flex items-baseline gap-1.5">
                <dt className="label-technical">Current</dt>
                <dd className="data-technical text-[13px] font-medium text-ink whitespace-nowrap">
                  {Math.abs(current).toFixed(1)}
                  <span className="text-[10px] text-ink-4 ml-0.5">A</span>
                </dd>
              </div>
            )}
            {typeof power === 'number' && (
              <div className="flex items-baseline gap-1.5">
                <dt className="label-technical">Power</dt>
                <dd className="data-technical text-[13px] font-medium text-ink whitespace-nowrap">
                  {Math.abs(power).toFixed(2)}
                  <span className="text-[10px] text-ink-4 ml-0.5">kW</span>
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
