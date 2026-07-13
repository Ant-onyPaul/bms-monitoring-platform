

/**
 * Reusable PrimaryButton component with hover animation elevation effects,
 * blue-to-green gradient backgrounds, active click transitions, and a loading spinner.
 */
export default function PrimaryButton({
  children,
  type = 'submit',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : 'false'}
      className={`relative w-full flex items-center justify-center px-4 py-3.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 active:translate-y-[1px] active:scale-[0.99] hover:-translate-y-[1px] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-brand-blue/20 disabled:opacity-75 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:scale-100 disabled:hover:translate-y-0 shadow-[0_4px_16px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.3)] select-none cursor-pointer ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="tracking-wide">Signing in...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
