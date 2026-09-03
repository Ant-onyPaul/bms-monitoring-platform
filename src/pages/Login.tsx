import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import Logo from '../components/Logo';
import { LiveDot } from '../components/ui/Badge';
import { IconMail, IconLock, IconPack } from '../components/icons';

/* =============================================================================
   Login

   The first impression of the platform, so it carries the full design language:
   an ambient control room, an editorial brand column, and a single pane of
   glass holding the credentials.

   The glass panel is the point — it is the only element lifted off the room,
   and it sits over the brightest part of the ambient field so the blur has
   something to refract.

   Auth behaviour is untouched: mock sign-in routes to the admin dashboard,
   otherwise the Supabase-not-connected notice fires.
   ========================================================================== */

const FLEET_FACTS = [
  { label: 'Packs monitored', value: '1,240' },
  { label: 'Sample interval', value: '1s' },
  { label: 'Uptime, 90d', value: '99.98%' },
];

/** Twelve modules at their real states of charge — a legend for the product. */
const MODULE_CHARGE = [0.82, 0.79, 0.88, 0.61, 0.84, 0.9, 0.77, 0.86, 0.81, 0.87, 0.74, 0.89];

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Two layers the credential pane will refract: a brighter pool of light,
          and the engineering grid carried full-bleed. Without something
          textured behind it, "glass" is just a dark rectangle. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(880px 640px at 76% 34%, rgba(16,185,129,0.22), transparent 60%),' +
            'radial-gradient(720px 560px at 92% 74%, rgba(59,130,246,0.15), transparent 64%),' +
            'radial-gradient(680px 520px at 66% 8%, rgba(255,255,255,0.035), transparent 66%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 blueprint-grid opacity-90"
      />

      <div className="relative min-h-screen lg:grid lg:grid-cols-[1.08fr_1fr] xl:grid-cols-[1.2fr_1fr]">
        {/* ------------------------------------------------ Brand column */}
        <section className="relative hidden lg:flex flex-col justify-between px-12 xl:px-16 py-12">
          <div className="relative">
            <Logo showText size={32} />
          </div>

          <div className="relative max-w-xl">
            <p className="label-technical mb-6">Battery Management · Monitoring Platform</p>
            <h1 className="text-[42px] xl:text-[52px] leading-[1.04] font-semibold tracking-[-0.032em] text-ink">
              Every cell,
              <br />
              <span className="text-brand-ink">accounted for.</span>
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-3 max-w-md">
              Rack, module and cell-level telemetry for industrial energy storage — voltage spread,
              thermal behaviour and protection state, resolved down to the individual cell.
            </p>

            <PackSchematic />
          </div>

          <div className="relative">
            <div className="rule-fade mb-6" />
            <dl className="flex flex-wrap gap-x-12 gap-y-4">
              {FLEET_FACTS.map((fact) => (
                <div key={fact.label}>
                  <dt className="label-technical mb-2">{fact.label}</dt>
                  <dd className="data-technical text-[20px] font-medium text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ------------------------------------------------ Credential column */}
        <section className="relative flex flex-col justify-center px-5 sm:px-10 lg:px-12 xl:px-16 py-12">
          <div className="w-full max-w-[420px] mx-auto animate-slide-up-fade">
            <div className="lg:hidden mb-9">
              <Logo showText size={30} />
            </div>

            {/* The single pane of glass */}
            <div
              className="glass-modal rounded-[22px] p-7 sm:p-9
                shadow-[var(--shadow-e4),inset_0_1px_0_rgba(255,255,255,0.14)]"
            >
              <div className="flex items-center gap-2 mb-5">
                <LiveDot tone="ok" size={6} live />
                <span className="label-technical">Systems nominal</span>
              </div>

              <h2 className="text-[27px] font-semibold text-ink tracking-[-0.024em] leading-tight">
                Sign in
              </h2>
              <p className="mt-2.5 text-[13.5px] text-ink-3 leading-relaxed">
                Access is scoped to your role. Credentials are issued by your Shade Energy
                administrator.
              </p>

              <form className="space-y-4 mt-7" onSubmit={handleLogin}>
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

              <div className="mt-7 pt-6 border-t border-line flex items-start gap-2.5">
                <IconLock size={14} className="text-ink-4 shrink-0 mt-0.5" />
                <p className="text-[12px] text-ink-4 leading-relaxed">
                  Sessions are bound to a single role. Contact your administrator to change scope or
                  reset a password.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   PackSchematic

   Twelve modules at their real states of charge. It is a legend for the
   product, not an ornament: the fill heights use the same encoding as the
   module grid inside the app.
   -------------------------------------------------------------------------- */

function PackSchematic() {
  return (
    <figure className="mt-11">
      <figcaption className="flex items-center gap-2 mb-3.5">
        <IconPack size={13} className="text-ink-4" />
        <span className="label-technical">Rack 1 · module state of charge</span>
      </figcaption>

      <div className="flex items-end gap-1.5 h-24" role="img" aria-label="Module charge schematic">
        {MODULE_CHARGE.map((charge, index) => (
          <div
            key={index}
            className="relative flex-1 h-full rounded-[4px] bg-veil-1 border border-line overflow-hidden"
          >
            <span
              className={`absolute bottom-0 left-0 right-0 ${
                charge < 0.7
                  ? 'bg-gradient-to-t from-warn/70 to-warn/35'
                  : 'bg-gradient-to-t from-brand/70 to-brand/30'
              }`}
              style={{
                height: `${charge * 100}%`,
                animation: `slideUpFade 760ms var(--ease-out-soft) ${index * 45}ms both`,
              }}
            />
          </div>
        ))}
      </div>
    </figure>
  );
}
