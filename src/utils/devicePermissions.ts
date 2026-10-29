import type { Role } from '../types/database.types.ts';

/** Roles that can register (onboard) devices — matches where the app exposes "Register device". */
export const DEVICE_REGISTRATION_ROLES: readonly Role[] = ['admin', 'vendor'];

export function canRegisterDevices(role: Role | null | undefined): boolean {
  return role != null && DEVICE_REGISTRATION_ROLES.includes(role);
}
