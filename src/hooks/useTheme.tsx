import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

/* =============================================================================
   useTheme

   Theme state for the whole application. Purely presentational: it writes a
   `data-theme` attribute on <html> and nothing else. Every visual difference
   between light and dark is expressed as a token override in index.css, so no
   component branches on the theme and no component is duplicated.

   Dark — the glassmorphism direction — is the default. The OS preference is
   deliberately NOT consulted: the product ships dark unless a person chooses
   otherwise, and that choice is remembered.

   The initial attribute is set by a tiny inline script in index.html so the
   first paint is already correct; this provider only reads back what that
   script decided.
   ========================================================================== */

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'shade-energy-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

/** Reads whatever the pre-paint script already applied, falling back to dark. */
function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const applied = document.documentElement.getAttribute('data-theme');
  return applied === 'light' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState((current) => {
      if (current === next) return current;

      const root = document.documentElement;

      /* Enable the cross-fade for the duration of the change only. Leaving a
         global colour transition permanently applied would blunt every hover
         state in the app. */
      root.classList.add('theme-transition');
      window.setTimeout(() => root.classList.remove('theme-transition'), 260);

      root.setAttribute('data-theme', next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Private mode or blocked storage — the theme still applies for this session.
      }
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readInitialTheme() === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  /* Keep other tabs of the same session in step. */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !event.newValue) return;
      const next: Theme = event.newValue === 'light' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      setThemeState(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
