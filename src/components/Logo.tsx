/**
 * Shade Energy mark.
 *
 * A terminal disc divided by a rising edge: the ink field is the shade, the
 * green field is the charge beneath it. It is a single geometric division with
 * no gradient, so it stays legible at 18px in the sidebar and prints flat.
 */
export default function Logo({
  className = '',
  showText = false,
  size = 28,
}: {
  className?: string;
  showText?: boolean;
  size?: number;
}) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="shade-disc">
            <circle cx="16" cy="16" r="14" />
          </clipPath>
        </defs>

        {/* Shade field */}
        <circle cx="16" cy="16" r="14" fill="var(--color-ink)" />

        {/* Charge field, clipped to the disc */}
        <g clipPath="url(#shade-disc)">
          <path d="M -4 21.5 L 36 10.5 L 36 36 L -4 36 Z" fill="var(--color-brand)" />
        </g>

        {/* Terminal notch — reads the disc as a cell, not a generic circle */}
        <rect x="14.2" y="0" width="3.6" height="3.4" rx="1.2" fill="var(--color-ink)" />
      </svg>

      {showText && (
        <span className="flex items-baseline gap-1.5 leading-none">
          <span className="text-[15px] font-bold tracking-[-0.01em] text-ink">SHADE</span>
          <span className="text-[11px] font-semibold tracking-[0.14em] text-ink-3 uppercase">
            Energy
          </span>
        </span>
      )}
    </div>
  );
}
