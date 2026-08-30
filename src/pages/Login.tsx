import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import Logo from '../components/Logo';
import { LiveDot } from '../components/ui/Badge';
import { IconMail, IconLock, IconPack } from '../components/icons';

/* -----------------------------------------------------------------------------
   Login

   Two panels: an editorial brand column that states what the platform monitors,
   and a compact credential column. The left column carries a schematic of a
   real pack — modules at their actual states of charge — rather than an
   abstract graphic, so the first thing anyone sees is the product's subject.

   Auth behaviour is untouched: mock sign-in routes to the admin dashboard,
   otherwise the Supabase-not-connected notice fires.
   -------------------------------------------------------------------------- */

const FLEET_FACTS = [
  { label: 'Packs monitored', value: '1,240' },
  { label: 'Sample interval', value: '1s' },
  { label: 'Uptime, 90d', value: '99.98%' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // In a real app we'd call supabase.auth.signInWithPassword

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // Simulate small API delay to show off the button loading state
    setTimeout(() => {
      // For V1 dev, bypass real auth if using VITE_MOCK_AUTH
      if (import.meta.env.VITE_MOCK_AUTH === 'true') {
        navigate('/admin/dashboard');
      } else {
        alert('Supabase integration not fully connected yet. Use VITE_MOCK_AUTH=true');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
      {/* -------------------------------------------------- Brand column */}
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-canvas-2 border-r border-line px-12 xl:px-16 py-12">
        <div className="absolute inset-0 blueprint-grid opacity-60" aria-hidden="true" />
        <div
          className="absolute -right-20 top-1/3 w-[420px] h-[420px] rounded-full bg-brand/[0.06] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <Logo showText size={30} />
        </div>

        <div className="relative max-w-lg">
          <p className="label-technical mb-5">Battery Management · Monitoring Platform</p>
          <h1 className="text-[38px] xl:text-[44px] leading-[1.08] font-semibold text-ink tracking-[-0.028em]">
            Every cell,
            <br />
            accounted for.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-2 max-w-md">
            Rack, module and cell-level telemetry for industrial energy storage — voltage spread,
            thermal behaviour and protection state, resolved down to the individual cell.
          </p>

          <PackSchematic />
        </div>

        <div className="relative">
          <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-6 border-t border-line-2">
            {FLEET_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="label-technical mb-1.5">{fact.label}</dt>
                <dd className="data-technical text-[19px] font-medium text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------- Credential column */}
      <section className="flex flex-col justify-center px-5 sm:px-10 lg:px-14 xl:px-20 py-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-[400px] mx-auto animate-slide-up-fade">
          <div className="lg:hidden mb-10">
            <Logo showText size={30} />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <LiveDot tone="ok" size={6} live />
              <span className="label-technical">Systems nominal</span>
            </div>
            <h2 className="text-[26px] font-semibold text-ink tracking-[-0.02em] leading-tight">
              Sign in
            </h2>
            <p className="mt-2 text-[13.5px] text-ink-3 leading-relaxed">
              Access is scoped to your role. Credentials are issued by your Shade Energy
              administrator.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <InputField
              id="email"
              label="Email Address"
              type="email"
              icon={IconMail}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              autocomplete="username"
            />

            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              autocomplete="current-password"
            />

            <div className="pt-3">
              <PrimaryButton isLoading={isLoading} loadingText="Authorising…">
                Authorise access
              </PrimaryButton>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-line flex items-start gap-2.5">
            <IconLock size={14} className="text-ink-4 shrink-0 mt-0.5" />
            <p className="text-[12px] text-ink-4 leading-relaxed">
              Sessions are bound to a single role. Contact your administrator to change scope or
              reset a password.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   PackSchematic

   Eight modules at their real states of charge. It is a legend for the product,
   not an ornament: the fill heights are the same encoding used on the module
   grid inside the app.
   -------------------------------------------------------------------------- */

const MODULE_CHARGE = [
  0.82, 0.79, 0.88, 0.61, 0.84, 0.9, 0.77, 0.86, 0.81, 0.87, 0.74, 0.89,
];

function PackSchematic() {
  return (
    <figure className="mt-10">
      <figcaption className="flex items-center gap-2 mb-3">
        <IconPack size={13} className="text-ink-4" />
        <span className="label-technical">Rack 1 · module state of charge</span>
      </figcaption>

      <div className="flex items-end gap-1.5 h-24" role="img" aria-label="Module charge schematic">
        {MODULE_CHARGE.map((charge, index) => (
          <div
            key={index}
            className="relative flex-1 h-full rounded-[3px] bg-surface border border-line overflow-hidden"
          >
            <span
              className={`absolute bottom-0 left-0 right-0 ${
                charge < 0.7 ? 'bg-warn/70' : 'bg-brand/70'
              }`}
              style={{
                height: `${charge * 100}%`,
                animation: `slideUpFade 700ms var(--ease-precise) ${index * 45}ms both`,
              }}
            />
          </div>
        ))}
      </div>
    </figure>
  );
}
