import { API_URL_VALUE, TOKEN_KEY } from '../lib/api';
import { DEMO_ACCOUNTS, DEMO_TOKEN_PREFIX, createDemoApi } from './demoApi';

/* =============================================================================
   Dev demo backend installer — DEVELOPMENT ONLY.

   Guards, outermost first:
     1. src/main.tsx imports this module only when
        `import.meta.env.DEV && import.meta.env.MODE === 'development'
         && import.meta.env.VITE_DEV_DEMO_BACKEND === 'true'`.
        `vite build` replaces DEV with false, so the import — and this whole
        module — is removed from production builds.
     2. installDemoBackend() refuses to run unless the page is served from a
        loopback host.
     3. Only requests addressed to the app's API (`${API_URL}/api/…`) are
        answered here, and none of them is forwarded to a network: no request
        reaches a real backend while the demo backend is active. Everything
        else (Vite, fonts, assets) passes through untouched.

   The app's auth, routing and API client are unmodified; they simply talk to
   the simulated API in demoApi.ts. A fixed ribbon on every page states that.
   ========================================================================== */

const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const LATENCY_MS = 120;

function isApiRequest(url: URL) {
  if (!url.pathname.startsWith('/api/')) return false;
  // An empty API_URL means same-origin; otherwise match the configured API origin exactly.
  const apiOrigin = API_URL_VALUE ? new URL(API_URL_VALUE, window.location.origin).origin : window.location.origin;
  return url.origin === apiOrigin;
}

function requestParts(input: RequestInfo | URL, init?: RequestInit) {
  const request = input instanceof Request ? input : null;
  const url = new URL(request ? request.url : String(input), window.location.origin);
  const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
  const headers = new Headers(init?.headers ?? request?.headers);
  let body: unknown = null;
  if (typeof init?.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = null;
    }
  }
  return { url, method, authorization: headers.get('Authorization'), body };
}

function showRibbon() {
  if (document.getElementById('dev-demo-backend-ribbon')) return;
  const ribbon = document.createElement('div');
  ribbon.id = 'dev-demo-backend-ribbon';
  ribbon.setAttribute('role', 'status');
  ribbon.textContent =
    'SIMULATED · DEMO MODE — sample data, not real devices or accounts · sign in as ' +
    'demo-admin@ / demo-vendor@ / demo-customer@shade.test, any password';
  Object.assign(ribbon.style, {
    position: 'fixed',
    left: '50%',
    bottom: '12px',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    pointerEvents: 'none',
    padding: '6px 14px',
    borderRadius: '999px',
    background: '#b45309',
    color: '#fff',
    font: '600 11.5px/1.3 system-ui, -apple-system, sans-serif',
    letterSpacing: '0.04em',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    whiteSpace: 'nowrap',
    maxWidth: 'calc(100vw - 24px)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  });
  document.body.appendChild(ribbon);
}

export function installDemoBackend(): boolean {
  if (!LOOPBACK.has(window.location.hostname)) {
    console.error('[dev-demo-backend] Refused: only runs on localhost.');
    return false;
  }

  const demo = createDemoApi();
  const realFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const { url, method, authorization, body } = requestParts(input, init);
    if (!isApiRequest(url)) return realFetch(input, init);

    const response = demo.handle({ method, path: url.pathname, query: url.searchParams, authorization, body });
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
    return new Response(JSON.stringify(response.body), {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'X-Dev-Demo-Backend': 'true' },
    });
  };

  // A real session token left from an earlier run would be rejected anyway; clearing it avoids the extra round trip.
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored && !stored.startsWith(DEMO_TOKEN_PREFIX)) localStorage.removeItem(TOKEN_KEY);

  showRibbon();
  console.info(
    `[dev-demo-backend] SIMULATED API active. Sign in as ${DEMO_ACCOUNTS.join(', ')} with any password.`,
  );
  return true;
}
