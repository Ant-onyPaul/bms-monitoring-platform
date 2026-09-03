import React from 'react';

/* =============================================================================
   SHADE ENERGY — ICON SYSTEM

   One geometric family, drawn on a 24x24 grid at 1.5 stroke.
   Icons carry meaning inside the information hierarchy: they are never
   decorative, never dropped into a coloured circle by default, and they
   inherit `currentColor` so status colour comes from context.

   Domain icons (pack, module, cell, voltage, current, thermal, balancing,
   protection, comms) are drawn from the hardware they describe — a module is
   four cells in series, a pack is a terminal block — so an engineer reads the
   part, not a generic glyph.
   ========================================================================== */

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  /** Rendered size in px. Defaults to 1em so icons track their text. */
  size?: number | string;
  /** Stroke weight. 1.5 is the system default; 2 for very small sizes. */
  weight?: number;
}

function Svg({ size = '1em', weight = 1.5, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* --- Energy & telemetry ---------------------------------------------------- */

/** Battery pack — terminal block with series segments. */
export const IconPack = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.25" y="6.5" width="16.5" height="11" rx="2" />
    <path d="M21.5 10v4" />
    <path d="M6.2 10v4M9.9 10v4M13.6 10v4" />
  </Svg>
);

/** Voltage — potential across a cell terminal. */
export const IconVoltage = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13.2 2.5 4.8 13.4h6.1L10.8 21.5l8.4-10.9h-6.1l.1-8.1Z" />
  </Svg>
);

/** Current — directed flow into a terminal. */
export const IconCurrent = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.8 12h12.4" />
    <path d="M11.9 8.3 15.6 12l-3.7 3.7" />
    <path d="M19.4 6v12" />
  </Svg>
);

/** Power — output gauge with needle. */
export const IconPower = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.9 17.5a9.5 9.5 0 1 1 16.2 0" />
    <path d="m12 13.6 4-4.6" />
    <circle cx="12" cy="17.5" r="1.15" />
  </Svg>
);

/** Temperature — NTC probe. */
export const IconTemperature = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 14.9V5.2a2 2 0 1 0-4 0v9.7a4 4 0 1 0 4 0Z" />
    <path d="M12 9.3v5.9" />
  </Svg>
);

/** State of charge / capacity ring. */
export const IconCharge = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="m12.6 6.8-3.4 5.4h3.2l-.6 5 3.4-5.4h-3.2l.6-5Z" />
  </Svg>
);

/** Cycle count — charge/discharge round trip. */
export const IconCycle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.6 12.8A8.6 8.6 0 0 1 6.3 18.4" />
    <path d="M3.4 11.2A8.6 8.6 0 0 1 17.7 5.6" />
    <path d="M17.9 2.3v3.5h-3.5" />
    <path d="M6.1 21.7v-3.5h3.5" />
  </Svg>
);

/** State of health — vitals trace. */
export const IconHealth = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12h4l2.4-6.6 4.6 13.2 2.4-6.6h5.6" />
  </Svg>
);

/* --- Hardware topology ----------------------------------------------------- */

/** Module — four cells in series inside a housing. */
export const IconModule = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.4" y="5.6" width="19.2" height="12.8" rx="2" />
    <path d="M7.2 5.6v12.8M12 5.6v12.8M16.8 5.6v12.8" />
  </Svg>
);

/** Single cell — prismatic can with terminal. */
export const IconCell = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6.4" y="4.6" width="11.2" height="15.4" rx="1.8" />
    <path d="M9.6 4.6V3.3a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v1.3" />
    <path d="M9.6 12.2h4.8" />
  </Svg>
);

/** Cell map — the dense voltage grid. */
export const IconCellGrid = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7.2" height="7.2" rx="1.4" />
    <rect x="13.8" y="3" width="7.2" height="7.2" rx="1.4" />
    <rect x="3" y="13.8" width="7.2" height="7.2" rx="1.4" />
    <rect x="13.8" y="13.8" width="7.2" height="7.2" rx="1.4" />
  </Svg>
);

/** Rack — stacked modules with status LEDs. */
export const IconRack = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3.2" width="18" height="7.2" rx="1.8" />
    <rect x="3" y="13.6" width="18" height="7.2" rx="1.8" />
    <path d="M6.6 6.8h.01M6.6 17.2h.01" />
    <path d="M10.2 6.8h4.4M10.2 17.2h4.4" />
  </Svg>
);

/** Device / installed unit. */
export const IconDevice = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="4.5" width="15" height="15" rx="2.2" />
    <rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1.1" />
    <path d="M9.2 1.9v2.6M14.8 1.9v2.6M9.2 19.5v2.6M14.8 19.5v2.6M1.9 9.2h2.6M1.9 14.8h2.6M19.5 9.2h2.6M19.5 14.8h2.6" />
  </Svg>
);

/** Fleet / multiple sites. */
export const IconFleet = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.6 2.8 7.2 12 11.8l9.2-4.6L12 2.6Z" />
    <path d="m2.8 16.8 9.2 4.6 9.2-4.6" />
    <path d="m2.8 12 9.2 4.6L21.2 12" />
  </Svg>
);

/* --- State & protection ---------------------------------------------------- */

/** Communication link quality. */
export const IconComms = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 19.8h.01" />
    <path d="M8.7 16.3a4.7 4.7 0 0 1 6.6 0" />
    <path d="M5.4 12.9a9.4 9.4 0 0 1 13.2 0" />
    <path d="M2.1 9.5a14.1 14.1 0 0 1 19.8 0" />
  </Svg>
);

/** Communication lost. */
export const IconCommsOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 19.8h.01" />
    <path d="M8.7 16.3a4.7 4.7 0 0 1 4.9-1.1" />
    <path d="M5.4 12.9a9.4 9.4 0 0 1 3.2-2.1" />
    <path d="M2.1 9.5a14.1 14.1 0 0 1 4.4-2.9" />
    <path d="M17.4 12.4a9.4 9.4 0 0 1 1.2.5" />
    <path d="M13.1 6.8a14.1 14.1 0 0 1 8.8 2.7" />
    <path d="M3 3l18 18" />
  </Svg>
);

/** Passive balancing active. */
export const IconBalancing = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 21v-6.4M5 10.2V3M12 21v-8.4M12 8.4V3M19 21v-4.4M19 12.2V3" />
    <path d="M2.6 14.6h4.8M9.6 8.4h4.8M16.6 16.6h4.8" />
  </Svg>
);

/** Protection / contactor state. */
export const IconProtection = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.8 4.6 5.9v6.2c0 4.4 3.1 8.2 7.4 9.1 4.3-.9 7.4-4.7 7.4-9.1V5.9L12 2.8Z" />
    <path d="m9.1 12.4 1.9-2.9 1.9 4.4 1.4-2.6h1.6" />
  </Svg>
);

/** Contactor closed / circuit connected. */
export const IconContactor = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12h4.2M17.3 12h4.2" />
    <circle cx="7.6" cy="12" r="1" />
    <circle cx="16.4" cy="12" r="1" />
    <path d="m8.4 11.4 7.2-2.6" />
  </Svg>
);

/** Imbalance / voltage spread. */
export const IconImbalance = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 19V9.6M9.8 19V4.5M15.1 19v-7.4M20.4 19v-12" />
    <path d="M2.6 21.2h18.8" />
  </Svg>
);

/* --- Status ---------------------------------------------------------------- */

export const IconWarning = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10.3 3.7 2 18.1a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9.2v4.6M12 17.4h.01" />
  </Svg>
);

export const IconFault = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.5 2.6h7L21.4 8.5v7l-5.9 5.9h-7L2.6 15.5v-7L8.5 2.6Z" />
    <path d="m14.6 9.4-5.2 5.2M9.4 9.4l5.2 5.2" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M12 16.2v-4.6M12 8.2h.01" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4.6 12.6 5 5 9.8-11" />
  </Svg>
);

export const IconCheckCircle = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="m8.1 12.3 2.8 2.8 5.4-5.6" />
  </Svg>
);

export const IconOffline = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M5.5 5.5l13 13" />
  </Svg>
);

/* --- Navigation & chrome --------------------------------------------------- */

export const IconDashboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7.6" height="8.8" rx="1.6" />
    <rect x="13.4" y="3" width="7.6" height="5.4" rx="1.6" />
    <rect x="3" y="15.2" width="7.6" height="5.8" rx="1.6" />
    <rect x="13.4" y="11.8" width="7.6" height="9.2" rx="1.6" />
  </Svg>
);

export const IconVendors = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="7" width="19" height="13.6" rx="2" />
    <path d="M8.6 7V5.2a1.7 1.7 0 0 1 1.7-1.7h3.4a1.7 1.7 0 0 1 1.7 1.7V7" />
    <path d="M2.5 12.4h19" />
    <path d="M10.6 12.4v1.8h2.8v-1.8" />
  </Svg>
);

export const IconCustomers = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15.4 20.6v-1.8a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1.8" />
    <circle cx="8.7" cy="7.2" r="3.7" />
    <path d="M22 20.6v-1.8a4 4 0 0 0-3-3.87" />
    <path d="M16.4 3.7a4 4 0 0 1 0 7" />
  </Svg>
);

export const IconLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.6 21H5.2A2.2 2.2 0 0 1 3 18.8V5.2A2.2 2.2 0 0 1 5.2 3h4.4" />
    <path d="M16.2 16.6 20.8 12l-4.6-4.6" />
    <path d="M20.8 12H9.6" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.4 6.8h17.2M3.4 12h17.2M3.4 17.2h17.2" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.8" cy="10.8" r="7.3" />
    <path d="m16.1 16.1 4.8 4.8" />
  </Svg>
);

export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 8.7a6 6 0 0 0-12 0c0 6.3-2.4 8.1-2.4 8.1h16.8S18 15 18 8.7Z" />
    <path d="M13.7 20.4a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6.2 9.4 5.8 5.6 5.8-5.6" />
  </Svg>
);

export const IconChevronUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6.2 14.6 5.8-5.6 5.8 5.6" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9.4 6.2 5.6 5.8-5.6 5.8" />
  </Svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="m14.6 6.2-5.6 5.8 5.6 5.8" />
  </Svg>
);

export const IconArrowUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20V4.4" />
    <path d="M5.6 10.8 12 4.4l6.4 6.4" />
  </Svg>
);

export const IconArrowDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v15.6" />
    <path d="M18.4 13.2 12 19.6l-6.4-6.4" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12H4.4" />
    <path d="M10.8 5.6 4.4 12l6.4 6.4" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h15.6" />
    <path d="M13.2 5.6 19.6 12l-6.4 6.4" />
  </Svg>
);

export const IconCopy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8.6" y="8.6" width="12" height="12" rx="2" />
    <path d="M15.4 8.6V5.4a2 2 0 0 0-2-2H5.4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3.2" />
  </Svg>
);

export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.4 11.4A8.5 8.5 0 0 0 6.1 6.1L2.6 9.4" />
    <path d="M3.6 12.6a8.5 8.5 0 0 0 14.3 5.3l3.5-3.3" />
    <path d="M2.6 5.2v4.2h4.2" />
    <path d="M21.4 18.8v-4.2h-4.2" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.6v11.2" />
    <path d="m7.6 10.4 4.4 4.4 4.4-4.4" />
    <path d="M3.6 17.6v1.2A2.2 2.2 0 0 0 5.8 21h12.4a2.2 2.2 0 0 0 2.2-2.2v-1.2" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M12 6.8V12l3.4 2.1" />
  </Svg>
);

export const IconHistory = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.2 12a8.8 8.8 0 1 0 2.6-6.2" />
    <path d="M3 3.4V9h5.6" />
    <path d="M12 7.6V12l3.2 1.9" />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M1.9 12S5.9 5.1 12 5.1 22.1 12 22.1 12 18.1 18.9 12 18.9 1.9 12 1.9 12Z" />
    <circle cx="12" cy="12" r="3.1" />
  </Svg>
);

export const IconEyeOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.9 5.4A9.7 9.7 0 0 1 12 5.1c6.1 0 10.1 6.9 10.1 6.9a18.4 18.4 0 0 1-2.7 3.6" />
    <path d="M6.3 6.6A18.5 18.5 0 0 0 1.9 12s4 6.9 10.1 6.9a9.6 9.6 0 0 0 4.3-1" />
    <path d="M9.8 9.9a3.1 3.1 0 0 0 4.3 4.3" />
    <path d="m3 3 18 18" />
  </Svg>
);

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.2" y="10.3" width="15.6" height="10.5" rx="2" />
    <path d="M7.9 10.3V7.4a4.1 4.1 0 0 1 8.2 0v2.9" />
    <path d="M12 14.6v2.2" />
  </Svg>
);

export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="4.8" width="19" height="14.4" rx="2" />
    <path d="m3.2 6.6 8.8 6.3 8.8-6.3" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconMinus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const IconFilter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.4 5.4h17.2l-6.7 7.9v5.4l-3.8 2v-7.4L3.4 5.4Z" />
  </Svg>
);

export const IconSort = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7.6 4.6v14.8M7.6 4.6 4.4 7.8M7.6 4.6l3.2 3.2" />
    <path d="M16.4 19.4V4.6M16.4 19.4l-3.2-3.2M16.4 19.4l3.2-3.2" />
  </Svg>
);

export const IconMore = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="5.2" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18.8" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconExternal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3.6h6.4V10" />
    <path d="M20.4 3.6 11.6 12.4" />
    <path d="M18.4 14.4v4.4a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2H10" />
  </Svg>
);

export const IconLocation = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 10.3c0 5.6-8 12.2-8 12.2s-8-6.6-8-12.2a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10.2" r="2.7" />
  </Svg>
);

export const IconCommand = (p: IconProps) => (
  <Svg {...p}>
    <path d="M17.4 3.6a2.9 2.9 0 0 0-2.9 2.9v11a2.9 2.9 0 1 0 2.9-2.9H6.6a2.9 2.9 0 1 0 2.9 2.9v-11a2.9 2.9 0 1 0-2.9 2.9h10.8" />
  </Svg>
);

export const IconTrend = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.2 3.2v16.1a1.5 1.5 0 0 0 1.5 1.5h16.1" />
    <path d="m7.4 15.4 3.6-4.6 3 3 5.4-6.6" />
  </Svg>
);

export const IconBars = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.2 3.2v16.1a1.5 1.5 0 0 0 1.5 1.5h16.1" />
    <path d="M8 17v-4.6M12.4 17V8.4M16.8 17v-6.8" />
  </Svg>
);

export const IconSliders = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21v-7M4 10V3M12 21v-11M12 6V3M20 21v-4M20 13V3" />
    <path d="M1.6 14h4.8M9.6 10h4.8M17.6 17h4.8" />
  </Svg>
);

/** Brand-adjacent: an energy leaf/spark used for the mark only. */
export const IconSpark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.5c0 4.4-3.4 5.6-3.4 9.4a3.4 3.4 0 0 0 6.8 0c0-3.8-3.4-5-3.4-9.4Z" />
    <path d="M12 15.3v6.2" />
  </Svg>
);

/* --- Operating state -------------------------------------------------------
   The three states share the same battery housing so they read as one family;
   only the glyph inside changes. That makes the state legible at 14px in a
   badge, where a colour change alone would not be enough.
   -------------------------------------------------------------------------- */

/** Charging — energy entering the pack. */
export const IconCharging = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.25" y="6.5" width="16.5" height="11" rx="2" />
    <path d="M21.5 10v4" />
    <path d="M11.9 8.7 8.4 13.1h3.2l-.5 3.3 3.5-4.4h-3.2l.5-3.3Z" />
  </Svg>
);

/** Discharging — energy leaving the pack through the terminal. */
export const IconDischarging = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.25" y="6.5" width="16.5" height="11" rx="2" />
    <path d="M21.5 10v4" />
    <path d="M6.4 12h7.2" />
    <path d="m11.2 9.5 2.5 2.5-2.5 2.5" />
  </Svg>
);

/** Idle — connected but not transferring energy. */
export const IconIdle = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.25" y="6.5" width="16.5" height="11" rx="2" />
    <path d="M21.5 10v4" />
    <path d="M8.5 9.9v4.2M13.1 9.9v4.2" />
  </Svg>
);

/** Energy throughput — kWh counters. */
export const IconEnergy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3" />
    <path d="M12.7 7.1 9.3 12.3h2.9l-.6 4.6 3.5-5.4h-2.9l.5-4.4Z" />
  </Svg>
);

/* --- Theme ------------------------------------------------------------------
   Drawn to the same 24-grid and stroke weight as the rest of the set so the
   toggle does not read as a borrowed icon.
   -------------------------------------------------------------------------- */

export const IconSun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.4v2.4M12 19.2v2.4M4.22 4.22l1.7 1.7M18.08 18.08l1.7 1.7M2.4 12h2.4M19.2 12h2.4M4.22 19.78l1.7-1.7M18.08 5.92l1.7-1.7" />
  </Svg>
);

export const IconMoon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.8 8.8 0 1 0 10.7 10.7Z" />
  </Svg>
);
