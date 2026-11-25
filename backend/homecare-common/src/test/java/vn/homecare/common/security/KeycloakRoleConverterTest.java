package vn.homecare.common.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

class KeycloakRoleConverterTest {

    private static Jwt jwt(Map<String, Object> claims) {
        return new Jwt("token", Instant.now(), Instant.now().plusSeconds(60), Map.of("alg", "RS256"), claims);
    }

    @Test
    @DisplayName("TC-US-15-003-1: role realm thành ROLE_*, bỏ role mặc định của Keycloak")
    void mapsRealmRoles() {
        var authorities = new KeycloakRoleConverter()
                .convert(jwt(Map.of("sub", "u1", "roles", List.of("CUSTOMER", "offline_access", "CAREGIVER"))));

        assertThat(authorities)
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_CUSTOMER", "ROLE_CAREGIVER");
    }

    @Test
    void fallsBackToRealmAccess() {
        var authorities = new KeycloakRoleConverter()
                .convert(jwt(Map.of("sub", "u1", "realm_access", Map.of("roles", List.of("ADMIN")))));

        assertThat(authorities).extracting(GrantedAuthority::getAuthority).containsExactly("ROLE_ADMIN");
    }

    @Test
    void noRolesMeansNoAuthorities() {
        assertThat(new KeycloakRoleConverter().convert(jwt(Map.of("sub", "u1"))))
                .isEmpty();
    }
}
