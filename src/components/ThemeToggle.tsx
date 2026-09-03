import { useTheme } from '../hooks/useTheme';
import { IconSun, IconMoon } from './icons';

/* -----------------------------------------------------------------------------
   ThemeToggle

   A two-stop segmented control rather than a single swap button: the current
   theme is stated rather than implied, which removes the "does this icon show
   the current mode or the one I'd get?" ambiguity that single-icon toggles
   always carry.

   Renders as a radiogroup so a screen reader announces both options and which
   is selected, and so arrow keys move between them.
   -------------------------------------------------------------------------- */

const OPTIONS = [
  { id: 'light' as const, label: 'Light', icon: IconSun },
  { id: 'dark' as const, label: 'Dark', icon: IconMoon },
];

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-[9px] glass-control ${className}`}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${option.label} theme`}
            title={`${option.label} theme`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setTheme(option.id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                setTheme(theme === 'dark' ? 'light' : 'dark');
              }
            }}
            className={`
              relative w-7 h-7 inline-flex items-center justify-center rounded-[7px]
              cursor-pointer
              transition-[background-color,color,box-shadow] duration-200
              [transition-timing-function:var(--ease-precise)]
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
              ${
                isActive
                  ? 'bg-veil-3 text-ink shadow-[var(--edge-lit)]'
                  : 'text-ink-3 hover:text-ink hover:bg-veil-1'
              }
            `}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
