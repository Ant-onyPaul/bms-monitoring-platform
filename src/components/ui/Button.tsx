import React from 'react';

/* -----------------------------------------------------------------------------
   Button

   Four intents, three sizes. Press feedback is a 1px optical settle rather than
   a scale transform, so buttons sitting in dense toolbars never jitter their
   neighbours. The accent fill is reserved for the single primary action on a
   view; everything else is a neutral surface.
   -------------------------------------------------------------------------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  iconRight?: React.ComponentType<{ size?: number | string; className?: string }>;
  fullWidth?: boolean;
}

/* The two filled variants resolve their gradient, border and shadow from theme
   tokens (see .btn-primary-fill in index.css): a lit green with near-black text
   on dark, the deep green with white text on light. Secondary is glass so it
   reads as chrome rather than as data. */
const VARIANTS: Record<Variant, string> = {
  primary: 'btn-primary-fill border hover:brightness-[1.06] active:brightness-95',
  secondary:
    'glass-control text-ink ' +
    'hover:bg-veil-3 hover:border-line-2 ' +
    'active:bg-veil-2 shadow-[var(--edge-lit)]',
  ghost:
    'bg-transparent text-ink-3 border border-transparent ' +
    'hover:bg-veil-2 hover:text-ink active:bg-veil-1',
  danger: 'btn-danger-fill border hover:brightness-[1.06] active:brightness-95',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5 rounded-[7px]',
  md: 'h-[38px] px-4 text-[13px] gap-2 rounded-[9px]',
  lg: 'h-11 px-5 text-[14px] gap-2 rounded-[10px]',
};

const ICON_SIZE: Record<Size, number> = { sm: 14, md: 15, lg: 16 };

export default function Button({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={`
        relative inline-flex items-center justify-center font-medium
        whitespace-nowrap select-none cursor-pointer
        transition-[background-color,border-color,box-shadow,transform,filter] duration-200
        [transition-timing-function:var(--ease-precise)]
        active:translate-y-px
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
        disabled:opacity-45 disabled:cursor-not-allowed disabled:active:translate-y-0
        disabled:shadow-none
        ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner size={ICON_SIZE[size]} />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={ICON_SIZE[size]} className="shrink-0 opacity-90" />}
          {children}
          {IconRight && <IconRight size={ICON_SIZE[size]} className="shrink-0 opacity-70" />}
        </>
      )}
    </button>
  );
}

function Spinner({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
