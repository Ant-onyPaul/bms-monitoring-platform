import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from './InputField';
import PasswordField from './PasswordField';
import PrimaryButton from './PrimaryButton';
import { IconMail } from './icons';

/**
 * LoginForm container managing email/password inputs, basic client validations,
 * submission state overrides, and loading indicators.
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const tempErrors: Record<string, string> = {};
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // Simulate API request delay before navigating
    setTimeout(() => {
      console.log('Login credentials:', { email, password, rememberMe });
      setIsLoading(false);
      navigate('/dashboard');
    }, 500);
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-4" noValidate>
      <InputField
        id="email"
        label="Email Address"
        type="email"
        icon={IconMail}
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
        }}
        error={errors.email}
        required
        autocomplete="username"
        enterKeyHint="next"
      />

      <PasswordField
        id="current-password"
        label="Password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
        }}
        error={errors.password}
        required
        autocomplete="current-password"
        enterKeyHint="done"
      />

      <div className="flex items-center justify-between gap-4 pt-1">
        <label className="group inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded-[4px] border border-line-2 bg-surface
              accent-[var(--color-brand-ink)] cursor-pointer
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          />
          <span className="text-[13px] text-ink-3 group-hover:text-ink transition-colors">
            Remember me
          </span>
        </label>

        <button
          type="button"
          onClick={() => alert('Password recovery flow is disabled in this mockup.')}
          className="text-[13px] font-medium text-brand-ink hover:text-brand-deep
            cursor-pointer transition-colors rounded
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Forgot password?
        </button>
      </div>

      <div className="pt-3">
        <PrimaryButton isLoading={isLoading} loadingText="Signing in…">
          Sign in
        </PrimaryButton>
      </div>
    </form>
  );
}
