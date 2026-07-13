import Logo from '../components/Logo';
import LoginForm from '../components/LoginForm';

/**
 * Login Page component orchestrating the split-screen design.
 * Left Side: Decorative telemetry SVG illustration of EV/grid battery charging metrics.
 * Right Side: Interactive LoginForm wrapped in a premium card.
 */
export default function Login() {
  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-brand-blue/20 selection:text-brand-blue animate-fade-in">
      
      {/* Left Column: Brand Marketing / EV Telemetry Illustration (Stacks on mobile) */}
      <section 
        className="w-full md:w-[50%] lg:w-[53%] xl:w-[58%] bg-slate-950 relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-12 text-white border-b md:border-b-0 md:border-r border-slate-900"
        aria-label="Platform Overview"
      >
        {/* Dynamic Gradient Radial Background Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(37,99,235,0.14),_transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_75%,_rgba(16,185,129,0.1),_transparent_50%)] pointer-events-none" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Header: Brand Name */}
        <div className="relative z-10 flex items-center gap-3">
          <Logo />
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white m-0">Shade Energy</h2>
            <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase m-0 leading-none">BMS Platform</p>
          </div>
        </div>

        {/* Main Content: Large Interactive Battery Vector Graphics */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6 md:py-10">
          <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] aspect-square flex items-center justify-center animate-float-subtle">
            
            {/* Battery Cells SVG Visualization */}
            <svg viewBox="0 0 500 500" fill="none" className="w-full h-full drop-shadow-[0_0_30px_rgba(16,185,129,0.12)]">
              {/* Outer Enclosure Frame */}
              <rect x="120" y="90" width="260" height="320" rx="20" stroke="rgba(255,255,255,0.12)" strokeWidth="4" fill="rgba(15,23,42,0.65)" />
              <rect x="136" y="106" width="228" height="288" rx="12" fill="rgba(10,15,30,0.85)" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
              
              {/* Standard Module Terminals */}
              <rect x="235" y="60" width="30" height="15" rx="3" fill="#2563EB" />
              <text x="250" y="71" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">+</text>
              <rect x="235" y="425" width="30" height="15" rx="3" fill="#64748B" />
              <text x="250" y="436" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">-</text>

              {/* Battery Cells Arrangement (12 cells in 4x3 matrix) */}
              {/* Row 1 */}
              <rect x="156" y="124" width="44" height="74" rx="6" fill="rgba(37,99,235,0.12)" stroke="#2563EB" strokeWidth="1.5" className="opacity-95" />
              <rect x="228" y="124" width="44" height="74" rx="6" fill="rgba(16,185,129,0.12)" stroke="#10B981" strokeWidth="1.5" className="opacity-95" />
              <rect x="300" y="124" width="44" height="74" rx="6" fill="rgba(16,185,129,0.12)" stroke="#10B981" strokeWidth="1.5" className="opacity-95" />

              {/* Row 2 */}
              <rect x="156" y="213" width="44" height="74" rx="6" fill="rgba(16,185,129,0.12)" stroke="#10B981" strokeWidth="1.5" className="opacity-95" />
              <rect x="228" y="213" width="44" height="74" rx="6" fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="2" className="animate-pulse-glow" />
              <rect x="300" y="213" width="44" height="74" rx="6" fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="2" className="animate-pulse-glow" />

              {/* Row 3 */}
              <rect x="156" y="302" width="44" height="74" rx="6" fill="rgba(37,99,235,0.12)" stroke="#2563EB" strokeWidth="1.5" className="opacity-95" />
              <rect x="228" y="302" width="44" height="74" rx="6" fill="rgba(16,185,129,0.12)" stroke="#10B981" strokeWidth="1.5" className="opacity-95" />
              <rect x="300" y="302" width="44" height="74" rx="6" fill="rgba(37,99,235,0.12)" stroke="#2563EB" strokeWidth="1.5" className="opacity-95" />

              {/* Inter-cell connection indicators (Busbars) */}
              <path d="M 178 106 L 178 394 M 250 106 L 250 394 M 322 106 L 322 394" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
              
              {/* Outer Energy Flow Path Animation */}
              <path 
                d="M 250 75 H 128 V 410 H 372 V 75 H 250" 
                stroke="url(#bmsWireGradient)" 
                strokeWidth="3" 
                strokeLinecap="round"
                className="animate-flow"
              />

              <defs>
                <linearGradient id="bmsWireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>

              {/* Connection pointers to Metric Cards */}
              <line x1="344" y1="250" x2="420" y2="230" stroke="rgba(16,185,129,0.4)" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="344" cy="250" r="2.5" fill="#10B981" />
              
              <line x1="156" y1="160" x2="80" y2="180" stroke="rgba(37,99,235,0.4)" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="156" cy="160" r="2.5" fill="#2563EB" />
            </svg>

            {/* Floating Glassmorphic Telemetry Card 1 */}
            <div className="absolute -right-4 lg:-right-8 top-[32%] bg-slate-900/70 backdrop-blur-md border border-white/8 rounded-xl p-3 sm:p-4 shadow-xl flex flex-col gap-1 min-w-[110px] sm:min-w-[130px] transition-all">
              <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">State of Charge</span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400">84.2%</span>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[84%]" />
              </div>
            </div>

            {/* Floating Glassmorphic Telemetry Card 2 */}
            <div className="absolute -left-4 lg:-left-8 bottom-[24%] bg-slate-900/70 backdrop-blur-md border border-white/8 rounded-xl p-3 sm:p-4 shadow-xl flex flex-col gap-2 min-w-[125px] sm:min-w-[145px] transition-all">
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pack Live Stats</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-400 font-semibold uppercase leading-none">Voltage</span>
                  <span className="text-xs font-bold text-white mt-0.5">3.82 V</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-400 font-semibold uppercase leading-none">Temp</span>
                  <span className="text-xs font-bold text-white mt-0.5">29.4°C</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-400 font-semibold uppercase leading-none">Current</span>
                  <span className="text-xs font-bold text-white mt-0.5">-14.2 A</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-400 font-semibold uppercase leading-none">Balancing</span>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-400 mt-0.5">Active</span>
                </div>
              </div>
            </div>

          </div>

          {/* Subtitle Branding Info */}
          <div className="text-center max-w-md mt-4 px-4 select-none">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
              Shade Energy
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-emerald-400 tracking-widest uppercase mb-2.5">
              Battery Management Monitoring Platform
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              Real-time monitoring, analytics and intelligent battery management.
            </p>
          </div>
        </div>

        {/* Footer Brand Notes */}
        <div className="relative z-10 text-[9px] text-slate-500 font-semibold uppercase tracking-wider text-left border-t border-slate-900/60 pt-4 hidden md:block select-none">
          Shade Energy BMS SaaS • Cloud Interface v2.4.1
        </div>
      </section>

      {/* Right Column: Centered Login Card */}
      <section 
        className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 lg:p-20 bg-slate-100/40 relative"
        aria-label="Authentication portal"
      >
        <div className="w-full max-w-md flex flex-col justify-center items-center py-6 md:py-0">
          
          {/* Glassmorphic/Light login card wrapper */}
          <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 sm:p-10 shadow-[0_16px_48px_rgba(15,23,42,0.06)] animate-slide-up-fade">
            
            {/* Header greetings */}
            <div className="text-left mb-6 select-none">
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Sign in to continue monitoring systems.
              </p>
            </div>

            {/* Form component */}
            <LoginForm />

          </div>

        </div>

        {/* Copyright Footer */}
        <div className="w-full max-w-md text-center text-xs text-slate-450 font-semibold mt-8 border-t border-slate-200/40 pt-4 select-none">
          &copy; {new Date().getFullYear()} Shade Energy. All rights reserved.
        </div>
      </section>

    </main>
  );
}
