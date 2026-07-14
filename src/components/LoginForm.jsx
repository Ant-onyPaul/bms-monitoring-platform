import { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import InputField from './InputField';
import PasswordField from './PasswordField';
import PrimaryButton from './PrimaryButton';

/**
 * LoginForm container managing email/password inputs, basic client validations,
 * submission state overrides, and loading indicators.
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // Simulate API request delay to showcase loading styles
    setTimeout(() => {
      console.log('Login credentials:', { email, password, rememberMe });
      setIsLoading(false);
      alert('Mock login triggered successfully! Check developer console to inspect logs.');
    }, 1500);
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-4" noValidate>
      {/* Email Address Input */}
      <InputField
        id="email"
        label="Email Address"
        type="email"
        icon={FiMail}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) {
            setErrors((prev) => ({ ...prev, email: '' }));
          }
        }}
        error={errors.email}
        required
        autocomplete="username"
        enterKeyHint="next"
      />

      {/* Password Input */}
      <PasswordField
        id="current-password"
        label="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) {
            setErrors((prev) => ({ ...prev, password: '' }));
          }
        }}
        error={errors.password}
        required
        autocomplete="current-password"
        enterKeyHint="done"
      />

      {/* Remember Me & Forgot Password Links */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium mt-1 select-none">
        <label className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4.5 h-4.5 rounded border border-slate-700 bg-slate-900/50 text-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer transition-all duration-200"
          />
          <span className="font-medium text-slate-400 group-hover:text-white transition-colors duration-200">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => alert('Password recovery flow is disabled in this mockup.')}
          className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors focus:outline-none focus:underline font-semibold cursor-pointer select-none"
        >
          Forgot Password?
        </button>
      </div>

      {/* Submit button */}
      <div className="pt-2">
        <PrimaryButton isLoading={isLoading}>
          Sign In
        </PrimaryButton>
      </div>
    </form>
  );
}
