package vn.homecare.common.security;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Maps Keycloak realm roles (13_RBAC: CUSTOMER, ELDER, CAREGIVER_PENDING, CAREGIVER, DISPATCHER, ADMIN, ACCOUNTANT,
 * PARTNER_ORG) to Spring authorities {@code ROLE_<NAME>}, so controllers use {@code @PreAuthorize("hasRole('ADMIN')")}.
 *
 * <p>Reads the flat claim {@code roles} (realm mapper in homecare-realm.json) and falls back to {@code
 * realm_access.roles}. Only roles whose name is all upper-case letters/underscore are kept, so Keycloak built-ins such as
 * {@code offline_access} never become authorities.
 */
public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    public static final String ROLES_CLAIM = "roles";

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        return toAuthorities(extractRoles(jwt.getClaims()));
    }

    public static Collection<GrantedAuthority> toAuthorities(Collection<String> roles) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>();
        for (String role : roles) {
            if (role != null && role.matches("[A-Z][A-Z_]*")) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
            }
        }
        return authorities;
    }

    public static List<String> extractRoles(Map<String, Object> claims) {
        Object flat = claims.get(ROLES_CLAIM);
        if (flat instanceof Collection<?> values) {
            return values.stream().map(String::valueOf).toList();
        }
        if (claims.get("realm_access") instanceof Map<?, ?> realmAccess
                && realmAccess.get("roles") instanceof Collection<?> values) {
            return values.stream().map(String::valueOf).toList();
        }
        return List.of();
    }
}
