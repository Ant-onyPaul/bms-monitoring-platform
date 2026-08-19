import { useState } from 'react';

/**
 * Reusable InputField component with floating label behavior, icon support,
 * custom validations, and modern aesthetics.
 */
export default function InputField({
  id,
  label,
  type = 'text',
  icon: Icon,
  value,
  onChange,
  error,
  required = false,
  autocomplete,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative w-full mb-5 text-left group">
      <div
        className={`relative flex items-center border rounded-xl transition-all duration-300 ease-out bg-card/50 backdrop-blur-sm
          ${error 
            ? 'border-destructive/80 shadow-[0_0_12px_rgba(239,68,68,0.15)] focus-within:border-destructive focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]' 
            : 'border-border hover:border-muted-foreground/30 focus-within:border-blue-500/50 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.15),0_0_12px_rgba(34,197,94,0.08)]'
          }
        `}
      >
        {/* Left Icon (Optional) */}
        {Icon && (
          <div className={`pl-4 transition-colors duration-300 ${isFocused ? 'text-blue-400' : 'text-muted-foreground'} pointer-events-none`}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Input Control */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autocomplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 pt-6 pb-2.5 text-sm text-foreground bg-transparent border-0 outline-none transition-all placeholder-transparent focus:placeholder-muted-foreground
            ${Icon ? 'pl-2.5' : 'pl-4'}
          `}
          placeholder={label}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`absolute left-0 top-0 pointer-events-none transition-all duration-200 ease-out origin-left text-muted-foreground text-sm
            ${Icon ? 'ml-[42px]' : 'ml-4'}
            ${isFloating 
              ? 'translate-y-1.5 scale-[0.78] text-[#22C55E] font-bold' 
              : 'translate-y-[15px] scale-100'
            }
            ${error && isFloating ? '!text-destructive' : ''}
          `}
        >
          {label}
          {required && <span className="text-destructive/80 ml-0.5">*</span>}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-red-400 font-semibold flex items-center gap-1 pl-1.5 animate-fade-in"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
