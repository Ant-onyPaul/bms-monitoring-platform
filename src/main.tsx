import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';

function render() {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
}

/* Development-only simulated backend, for inspecting the UI without the real
   API: `VITE_DEV_DEMO_BACKEND=true npm run dev`. In `vite build` the condition
   is the constant `false`, so the import and the src/dev module are removed
   from production output. See src/dev/demoBackend.ts. */
if (
  import.meta.env.DEV &&
  import.meta.env.MODE === 'development' &&
  import.meta.env.VITE_DEV_DEMO_BACKEND === 'true'
) {
  import('./dev/demoBackend')
    .then(({ installDemoBackend }) => installDemoBackend())
    .finally(render);
} else {
  render();
}
