import React, { useState } from 'react';
import Logo from './Logo';
import Button from './ui/Button';
import PasswordField from './PasswordField';
import { useAuth } from '../hooks/useAuth';

/* -----------------------------------------------------------------------------
   ChangePasswordScreen

   Shown in place of every protected page while the account still carries the
   one-time password it was onboarded with. The API refuses all other requests
   until this is done, so there is nothing behind it to reach.
   -------------------------------------------------------------------------- */

export default function ChangePasswordScreen() {
  const { profile, changePassword, signOut } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mismatch = confirm.length > 0 && next !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 10) return setError('Use at least 10 characters.');
    if (next !== confirm) return setError('The new passwords do not match.');
    setError(null);
    setIsSubmitting(true);
    try {
      await changePassword(current, next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change the password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[420px] animate-slide-up-fade">
        <div className="mb-8">
          <Logo showText size={30} />
        </div>
        <div className="glass-modal rounded-[22px] p-7 sm:p-9 shadow-[var(--shadow-e4)]">
          <h2 className="text-[24px] font-semibold text-ink tracking-[-0.02em] leading-tight">
            Set your password
          </h2>
          <p className="mt-2.5 text-[13.5px] text-ink-3 leading-relaxed">
            {profile?.email} is signed in with a temporary password. Choose your own to continue.
          </p>

          <form className="space-y-4 mt-7" onSubmit={handleSubmit}>
            {error && (
              <p role="alert" className="text-[13px] text-crit-ink">
                {error}
              </p>
            )}
            <PasswordField
              id="current-password"
              label="Temporary password"
              value={current}
              onChange={(e: any) => setCurrent(e.target.value)}
              required
            />
            <PasswordField
              id="new-password"
              label="New password (10+ characters)"
              value={next}
              onChange={(e: any) => setNext(e.target.value)}
              autocomplete="new-password"
              required
            />
            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              value={confirm}
              onChange={(e: any) => setConfirm(e.target.value)}
              autocomplete="new-password"
              error={mismatch ? 'Passwords do not match' : undefined}
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              loadingText="Saving…"
              disabled={!current || !next || !confirm || isSubmitting}
            >
              Save and continue
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={signOut}>
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
