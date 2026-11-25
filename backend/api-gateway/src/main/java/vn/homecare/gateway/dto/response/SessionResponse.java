package vn.homecare.gateway.dto.response;

import java.util.List;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import vn.homecare.common.security.KeycloakRoleConverter;

/**
 * Response of GET /api/v1/me/session (API-SV01-003, NM-0208): who is logged in, for the React router and menus.
 * Contains no token: the access/refresh tokens never leave the gateway (R-08).
 *
 * @param accountId identity-service account id (Keycloak user attribute {@code accountId}); null until identity-service
 *     links the Keycloak user (US-01-001)
 * @param fullName display name
 * @param roles realm roles of 13_RBAC, e.g. CUSTOMER, CAREGIVER
 * @param partnerOrgId partner hospital of a PARTNER_ORG / CAREGIVER account, otherwise null
 * @param csrfToken value to send in header X-XSRF-TOKEN (same as cookie XSRF-TOKEN)
 */
public record SessionResponse(
        String accountId, String fullName, List<String> roles, String partnerOrgId, String csrfToken) {

    public static SessionResponse of(OidcUser user, String csrfToken) {
        List<String> roles =
                KeycloakRoleConverter.toAuthorities(KeycloakRoleConverter.extractRoles(user.getClaims())).stream()
                        .map(authority -> authority.getAuthority().substring("ROLE_".length()))
                        .toList();
        return new SessionResponse(
                user.getClaimAsString("accountId"),
                user.getFullName(),
                roles,
                user.getClaimAsString("partnerOrgId"),
                csrfToken);
    }
}
