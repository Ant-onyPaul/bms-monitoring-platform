import { useState } from 'react';
import { IconLock, IconEye, IconEyeOff } from './icons';

/**
 * PasswordField
 *
 * Same field mechanics as InputField, plus a visibility toggle. The two eye
 * glyphs cross-fade in place instead of swapping instantly, which keeps the
 * control from flickering when someone toggles it repeatedly to check a typo.
 */
export default function PasswordField({
  id = 'current-password',
  label = 'Password',
  value,
  onChange,
  error,
  required = false,
  autocomplete = 'current-password',
  ...props
}: any) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="w-full text-left">
      <div
        className={`
          relative flex items-center h-14 rounded-md bg-surface border
          transition-[border-color,box-shadow] duration-200
          [transition-timing-function:var(--ease-precise)]
          ${
            error
              ? 'border-crit shadow-[0_0_0_3px_var(--color-crit-surface)]'
              : isFocused
                ? 'border-brand shadow-[0_0_0_3px_var(--color-brand-surface)]'
                : 'border-line-2 hover:border-line-3'
          }
        `}
      >
        <span
          className={`pl-3.5 shrink-0 pointer-events-none transition-colors duration-200 ${
            error ? 'text-crit' : isFocused ? 'text-brand-ink' : 'text-ink-4'
          }`}
        >
          <IconLock size={16} />
        </span>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autocomplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={label}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full h-full bg-transparent border-0 outline-none pt-5 pb-1.5 pl-2.5 pr-12
            text-[14px] text-ink placeholder:text-transparent"
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center
            justify-center rounded-md text-ink-4 hover:text-ink-2 hover:bg-surface-3
            cursor-pointer transition-colors duration-150"
        >
          <span className="relative block w-4 h-4">
            <IconEye
              size={16}
              className={`absolute inset-0 eye-icon-transition ${
                showPassword ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
              }`}
            />
            <IconEyeOff
              size={16}
              className={`absolute inset-0 eye-icon-transition ${
                showPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
            />
          </span>
        </button>

        <label
          htmlFor={id}
          className={`
            absolute left-[38px] top-0 pointer-events-none origin-left
            transition-[transform,font-size,color] duration-200
            [transition-timing-function:var(--ease-precise)]
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
