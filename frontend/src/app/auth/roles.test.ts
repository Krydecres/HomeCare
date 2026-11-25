import { describe, expect, it } from 'vitest';
import { resolveHomePath, toAppRoles } from './roles';

describe('resolveHomePath', () => {
  it('TC-US-15-008-5: each role lands on its own area', () => {
    expect(resolveHomePath(['CUSTOMER'], 'customer')).toBe('/customer');
    expect(resolveHomePath(['ELDER'], 'customer')).toBe('/elder');
    expect(resolveHomePath(['DISPATCHER'], 'customer')).toBe('/dispatch');
    expect(resolveHomePath(['ADMIN', 'CUSTOMER'], 'customer')).toBe('/admin');
    expect(resolveHomePath(['ACCOUNTANT'], 'customer')).toBe('/accounting');
    expect(resolveHomePath(['PARTNER_ORG'], 'customer')).toBe('/partner');
  });

  it('TC-US-01-009-1: caregiver switches interface without changing permissions', () => {
    expect(resolveHomePath(['CUSTOMER', 'CAREGIVER'], 'customer')).toBe('/customer');
    expect(resolveHomePath(['CUSTOMER', 'CAREGIVER'], 'caregiver')).toBe('/caregiver');
    expect(resolveHomePath(['CUSTOMER', 'CAREGIVER_PENDING'], 'caregiver')).toBe('/customer');
  });

  it('ignores unknown roles and technical Keycloak roles', () => {
    expect(toAppRoles(['CUSTOMER', 'offline_access', 'mfa_required'])).toEqual(['CUSTOMER']);
    expect(resolveHomePath([], 'customer')).toBe('/forbidden');
  });
});
