/** Realm roles of 13_RBAC as the gateway returns them in SessionResponse.roles. */
export const APP_ROLES = [
  'CUSTOMER',
  'ELDER',
  'CAREGIVER_PENDING',
  'CAREGIVER',
  'DISPATCHER',
  'ADMIN',
  'ACCOUNTANT',
  'PARTNER_ORG',
] as const;

export type AppRole = (typeof APP_ROLES)[number];

/** UI-17: a CAREGIVER account can switch between the customer and the caregiver interface (US-01-009). */
export type AppMode = 'customer' | 'caregiver';

export const ROLE_HOME: Record<AppRole, string> = {
  CUSTOMER: '/customer',
  ELDER: '/elder',
  CAREGIVER_PENDING: '/customer',
  CAREGIVER: '/caregiver',
  DISPATCHER: '/dispatch',
  ADMIN: '/admin',
  ACCOUNTANT: '/accounting',
  PARTNER_ORG: '/partner',
};

/** Internal roles first (an admin who is also a customer lands on the admin console), then elder, then mode. */
const PRIORITY: AppRole[] = ['ADMIN', 'DISPATCHER', 'ACCOUNTANT', 'PARTNER_ORG', 'ELDER'];

export function toAppRoles(roles: readonly string[] | undefined): AppRole[] {
  return (roles ?? []).filter((role): role is AppRole => (APP_ROLES as readonly string[]).includes(role));
}

export function resolveHomePath(roles: readonly AppRole[], mode: AppMode): string {
  const internal = PRIORITY.find((role) => roles.includes(role));
  if (internal) return ROLE_HOME[internal];
  if (roles.includes('CAREGIVER') && mode === 'caregiver') return ROLE_HOME.CAREGIVER;
  if (roles.includes('CUSTOMER') || roles.includes('CAREGIVER_PENDING') || roles.includes('CAREGIVER')) {
    return ROLE_HOME.CUSTOMER;
  }
  return '/forbidden';
}
