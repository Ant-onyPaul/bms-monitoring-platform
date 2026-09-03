import React, { useRef, useState } from 'react';

/* -----------------------------------------------------------------------------
   Tooltip

   On a dark ground the tooltip cannot be "the dark chip" — it lifts instead,
   as a bright-edged glass chip that sits clearly above the surface beneath it.
   Opens on hover *and* focus, with a short intent delay so sweeping the cursor
   across a 52-cell grid doesn't strobe tooltips.
   -------------------------------------------------------------------------- */

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const SIDES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export default function Tooltip({
  content,
  children,
  side = 'top',
  delay = 220,
  className = '',
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`
            absolute ${SIDES[side]} z-[80] pointer-events-none
            px-2.5 py-1.5 rounded-[8px] glass-menu
            text-ink text-[11.5px] font-medium leading-tight
            whitespace-nowrap animate-pop-in
          `}
        >
          {content}
        </span>
      )}
    </span>
  );
}
