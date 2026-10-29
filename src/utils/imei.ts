/* -----------------------------------------------------------------------------
   IMEI identifiers

   Two kinds of value can end up in a device's IMEI slot, and they are never
   interchangeable:

   - A real IMEI: exactly 15 digits whose last digit is a Luhn check digit.
   - A demo identifier (`DEMO-IMEI-0001`): produced only by the simulated
     discovery service while no backend / MQTT listener exists. It is visibly
     fictional and deliberately fails real-IMEI validation.
   -------------------------------------------------------------------------- */

export type ImeiSource = 'manual' | 'demo-simulation';

const DEMO_IDENTIFIER = /^DEMO-IMEI-\d{4}$/;

/** True only for a 15-digit IMEI with a valid Luhn check digit. */
export function isValidImei(value: string): boolean {
  if (!/^\d{15}$/.test(value)) return false;

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = Number(value[i]);
    // Double every second digit counting from the left (positions 2, 4, …, 14).
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** True for identifiers minted by the simulated discovery service. */
export function isDemoIdentifier(value: string): boolean {
  return DEMO_IDENTIFIER.test(value);
}

export function formatDemoIdentifier(sequence: number): string {
  return `DEMO-IMEI-${String(sequence).padStart(4, '0')}`;
}

/** Trims whitespace and the spaces/dashes people paste from device labels. */
export function normaliseImeiInput(value: string): string {
  return value.replace(/[\s-]/g, '');
}

/**
 * Validates a value against the rules for its source. Returns an error message,
 * or null when the value is acceptable. Empty is acceptable — IMEI is optional.
 */
export function validateImei(value: string, source: ImeiSource): string | null {
  if (value === '') return null;

  if (source === 'demo-simulation') {
    return isDemoIdentifier(value) ? null : 'Not a recognised demo identifier.';
  }

  if (isDemoIdentifier(value)) {
    return 'Demo identifiers can only be set through Detect IMEI.';
  }
  if (!/^\d+$/.test(value)) return 'IMEI must contain digits only.';
  if (value.length !== 15) return `IMEI must be 15 digits (${value.length} entered).`;
  if (!isValidImei(value)) return 'IMEI check digit is invalid.';
  return null;
}

/** Returns the existing device already holding this IMEI, if any. */
export function findDeviceWithImei<T extends { imei?: string | null }>(
  imei: string,
  devices: readonly T[],
): T | undefined {
  if (imei === '') return undefined;
  return devices.find((d) => d.imei === imei);
}
