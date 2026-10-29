import { formatDemoIdentifier, type ImeiSource } from '../utils/imei.ts';

/* -----------------------------------------------------------------------------
   IMEI discovery

   The onboarding form only talks to `ImeiDiscoveryService`. Today the only
   implementation is `DemoImeiDiscoveryService`, which fabricates a visibly
   fictional identifier after a short delay — no device is contacted and no
   MQTT message is received. A real implementation (e.g. one that waits for a
   device announcement relayed by the backend's MQTT listener) can replace it
   without the form changing.
   -------------------------------------------------------------------------- */

export interface ImeiDiscoveryResult {
  identifier: string;
  source: ImeiSource;
  /** True whenever the identifier was not reported by real hardware. */
  isDemo: boolean;
  discoveredAt: string;
}

export interface ImeiDiscoveryService {
  /** Rejects with an `AbortError` DOMException when `signal` is aborted. */
  discover(signal?: AbortSignal): Promise<ImeiDiscoveryResult>;
}

export class ImeiDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImeiDiscoveryError';
  }
}

export const isAbortError = (err: unknown) =>
  err instanceof DOMException && err.name === 'AbortError';

export interface DemoDiscoveryOptions {
  /** Simulated latency in milliseconds. */
  delayMs?: number;
  /** 1-based attempt numbers that should fail, to exercise retry paths. */
  failAttempts?: number[];
}

/**
 * Simulated discovery. Each successful attempt yields the next identifier in
 * the sequence `DEMO-IMEI-0001`, `DEMO-IMEI-0002`, … for this instance.
 */
export class DemoImeiDiscoveryService implements ImeiDiscoveryService {
  private attempts = 0;
  private sequence = 0;
  private readonly delayMs: number;
  private readonly failAttempts: number[];

  constructor({ delayMs = 1400, failAttempts = [] }: DemoDiscoveryOptions = {}) {
    this.delayMs = delayMs;
    this.failAttempts = failAttempts;
  }

  discover(signal?: AbortSignal): Promise<ImeiDiscoveryResult> {
    const attempt = ++this.attempts;

    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const abort = () => {
        clearTimeout(timer);
        reject(new DOMException('IMEI discovery cancelled', 'AbortError'));
      };

      if (signal?.aborted) {
        abort();
        return;
      }

      timer = setTimeout(() => {
        signal?.removeEventListener('abort', abort);
        if (this.failAttempts.includes(attempt)) {
          reject(new ImeiDiscoveryError('Simulated discovery timed out.'));
          return;
        }
        resolve({
          identifier: formatDemoIdentifier(++this.sequence),
          source: 'demo-simulation',
          isDemo: true,
          discoveredAt: new Date().toISOString(),
        });
      }, this.delayMs);

      signal?.addEventListener('abort', abort, { once: true });
    });
  }
}
