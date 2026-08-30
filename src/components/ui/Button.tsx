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

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-ink text-white border border-brand-ink ' +
    'hover:bg-brand-deep hover:border-brand-deep ' +
    'active:bg-brand-deep ' +
    'shadow-[0_1px_2px_rgba(4,120,87,0.24)] hover:shadow-[0_2px_6px_-1px_rgba(4,120,87,0.32)]',
  secondary:
    'bg-surface text-ink border border-line-2 ' +
    'hover:bg-surface-2 hover:border-line-3 ' +
    'active:bg-surface-3 shadow-[0_1px_1px_rgba(23,24,26,0.03)]',
  ghost:
    'bg-transparent text-ink-2 border border-transparent ' +
    'hover:bg-surface-3 hover:text-ink active:bg-canvas-2',
  danger:
    'bg-crit-ink text-white border border-crit-ink ' +
    'hover:bg-[#991B1B] hover:border-[#991B1B] ' +
    'shadow-[0_1px_2px_rgba(185,28,28,0.24)]',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5 rounded-[5px]',
  md: 'h-[38px] px-4 text-[13px] gap-2 rounded-md',
  lg: 'h-11 px-5 text-[14px] gap-2 rounded-md',
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
        transition-[background-color,border-color,box-shadow,transform] duration-150
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
