/**
 * True only on the local dev server started with VITE_DEV_DEMO_BACKEND=true —
 * the same condition under which src/main.tsx installs the dev demo backend.
 *
 * In demo mode the device workspace renders every section from the simulation
 * (the whole app is the demo, labelled by the permanent SIMULATED ribbon). In
 * any `vite build` this is the constant `false`, so production always takes
 * the live-API path.
 */
export const DEMO_MODE: boolean =
  import.meta.env.DEV &&
  import.meta.env.MODE === 'development' &&
  import.meta.env.VITE_DEV_DEMO_BACKEND === 'true';
