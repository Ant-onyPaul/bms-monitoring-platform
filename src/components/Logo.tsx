/**
 * Shade Energy circular vector brand logo.
 * Blue (#2563EB) to Green (#10B981) gradient with white "SE" initials and battery-inspired energy arcs.
 */
export default function Logo({ className = "", showText = false }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex-shrink-0 w-10 h-10">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_2px_8px_rgba(37,99,235,0.15)]"
        >
          <defs>
            <linearGradient id="seGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          {/* Outer circle base */}
          <circle cx="50" cy="50" r="48" fill="url(#seGradient)" />

          {/* Inner accent ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="white"
            strokeWidth="3"
            strokeOpacity="0.2"
          />

          {/* Energy arc stroke */}
          <path
            d="M 50 10 A 40 40 0 0 1 90 50 A 40 40 0 0 1 50 90 A 40 40 0 0 1 10 50"
            stroke="white"
            strokeWidth="3.5"
            strokeDasharray="40 15"
            strokeLinecap="round"
            className="opacity-90"
          />

          {/* Minimal charging bolt element behind text */}
          <path
            d="M 55 25 L 43 47 H 53 L 45 75 L 57 53 H 47 L 55 25 Z"
            fill="white"
            fillOpacity="0.15"
          />

          {/* Clean bold initials */}
          <text
            x="50%"
            y="51%"
            dominantBaseline="central"
            textAnchor="middle"
            fill="white"
            fontSize="34"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-1"
          >
            SE
          </text>
        </svg>
      </div>

      {showText && (
        <span className="font-sans font-bold tracking-tight text-foreground text-xl uppercase">
          SHADE<span className="text-[#10B981]"> ENERGY</span>
        </span>
      )}
    </div>
  );
}
