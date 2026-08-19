import { useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * Reusable PasswordField component with custom floating label behavior,
 * input visibility toggle (eye icon), autocomplete attributes, and error validations.
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
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || hasValue;

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="relative w-full mb-5 text-left group">
      <div
        className={`relative flex items-center border rounded-xl transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm
          ${error 
            ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.15)] focus-within:border-red-500 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]' 
            : 'border-slate-300 hover:border-slate-400 focus-within:border-brand-blue/50 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.15),0_0_12px_rgba(16,185,129,0.08)]'
          }
        `}
      >
        {/* Left Icon (Lock) */}
        <div className={`pl-4 transition-colors duration-300 ${isFocused ? 'text-brand-blue' : 'text-slate-500'} pointer-events-none`}>
          <FiLock className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autocomplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-2.5 pr-12 pt-6 pb-2.5 text-sm text-slate-900 bg-transparent border-0 outline-none transition-all placeholder-transparent focus:placeholder-slate-400"
          placeholder={label}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />

        {/* Show/Hide Toggle Button */}
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-900 focus:text-brand-blue outline-none rounded-md transition-colors cursor-pointer select-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {/* Animated eye icon container */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            <FiEye 
              className={`absolute inset-0 w-full h-full eye-icon-transition
                ${showPassword ? 'scale-75 opacity-0 rotate-45' : 'scale-100 opacity-100 rotate-0'}
              `}
            />
            <FiEyeOff 
              className={`absolute inset-0 w-full h-full eye-icon-transition
                ${showPassword ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 -rotate-45'}
              `}
            />
          </div>
        </button>

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`absolute left-0 top-0 pointer-events-none transition-all duration-200 ease-out origin-left text-slate-500 text-sm ml-10
            ${isFloating 
              ? 'translate-y-1.5 scale-[0.78] text-brand-green font-bold' 
              : 'translate-y-[15px] scale-100'
            }
            ${error && isFloating ? '!text-red-400' : ''}
          `}
        >
          {label}
          {required && <span className="text-red-400/80 ml-0.5">*</span>}
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
