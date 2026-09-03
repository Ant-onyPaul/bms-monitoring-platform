import { useState } from 'react';

/**
 * InputField
 *
 * Floating-label text input. The label parks in the field's upper zone rather
 * than overlaying the value, so a filled field always shows both what it is and
 * what it holds — important on forms an admin fills once and re-reads later.
 *
 * The API is unchanged: id, label, type, icon, value, onChange, error,
 * required, autocomplete, plus any native input props.
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
}: any) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="w-full text-left">
      <div
        className={`
          relative flex items-center h-14 rounded-[10px] bg-veil-1 border
          transition-[border-color,box-shadow,background-color] duration-200
          [transition-timing-function:var(--ease-precise)]
          ${
            error
              ? 'border-crit shadow-[0_0_0_3px_var(--color-crit-surface)]'
              : isFocused
                ? 'border-brand bg-veil-2 shadow-[0_0_0_3px_var(--color-brand-surface)]'
                : 'border-line-2 hover:border-line-3 hover:bg-veil-2'
          }
        `}
      >
        {Icon && (
          <span
            className={`pl-3.5 shrink-0 pointer-events-none transition-colors duration-200 ${
              error ? 'text-crit' : isFocused ? 'text-brand-ink' : 'text-ink-4'
            }`}
          >
            <Icon size={16} />
          </span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autocomplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={label}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            peer w-full h-full bg-transparent border-0 outline-none
            pt-5 pb-1.5 pr-3.5 ${Icon ? 'pl-2.5' : 'pl-3.5'}
            text-[14px] text-ink placeholder:text-transparent
          `}
          {...props}
        />

        <label
          htmlFor={id}
          className={`
            absolute top-0 pointer-events-none origin-left
            transition-[transform,font-size,color] duration-200
            [transition-timing-function:var(--ease-precise)]
            ${Icon ? 'left-[38px]' : 'left-3.5'}
            ${
              isFloating
                ? `translate-y-[9px] text-[10px] uppercase tracking-[0.09em] font-semibold ${
                    error ? 'text-crit-ink' : isFocused ? 'text-brand-ink' : 'text-ink-3'
                  }`
                : 'translate-y-[18px] text-[14px] text-ink-4'
            }
          `}
        >
          {label}
          {required && <span className="text-crit ml-0.5">*</span>}
        </label>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-[12px] font-medium text-crit-ink animate-fade-in"
        >
          {error}
        </p>
      )}
    </div>
  );
}
