package vn.homecare.identity.service;

import java.util.UUID;
import vn.homecare.identity.dto.request.GrantRoleRequest;
import vn.homecare.identity.entity.AppRole;

/**
 * Grants/revokes realm roles, keeping account_roles and Keycloak in sync. CAREGIVER and PARTNER_ORG are only granted
 * through {@link #grantByPartner} (caregiver-service, after a partner hospital approves – OQ-037, US-03-016).
 */
public interface RoleGrantService {

    /** API-SV04-020: caregiver-service only; refuses any other role (ROLE_NOT_GRANTABLE). */
    void grantByPartner(UUID accountId, GrantRoleRequest request);

    /** API-SV04-021: removes the role and signs the account out everywhere at once (US-01-009). */
    void revoke(UUID accountId, String role, String reason);

    /** Used inside identity-service (registration, internal accounts). */
    void grant(UUID accountId, AppRole role, UUID partnerOrgId, UUID grantedBy);
}
