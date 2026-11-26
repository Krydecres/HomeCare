package vn.homecare.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties {@code homecare.security.*}.
 *
 * @param jwt how every service validates Keycloak access tokens (US-15-003: signature via JWKS, issuer, audience,
 *     expiry; only RS256 accepted so {@code alg=none} is rejected)
 * @param encryptionKey base64 AES-256 key for {@link EncryptedStringConverter}; set from env HOMECARE_ENCRYPTION_KEY
 * @param lookupHashKey base64 HMAC key for {@link LookupHasher}; set from env HOMECARE_LOOKUP_HASH_KEY
 * @param publicEndpoints APIs whose role in 10_API_Contract is "Khách vãng lai", as {@code "POST /api/v1/otp"}.
 *     Each must ALSO carry {@code @PreAuthorize("permitAll()")} and be listed in the gateway (security review, R-35)
 */
@ConfigurationProperties("homecare.security")
public record HomecareSecurityProperties(
        Jwt jwt, String encryptionKey, String lookupHashKey, java.util.List<String> publicEndpoints) {

    /**
     * @param issuer expected {@code iss}, e.g. http://localhost:8180/realms/homecare
     * @param jwkSetUri JWKS endpoint reachable from the service (may differ from the issuer host inside Docker)
     * @param audience expected value inside {@code aud}
     */
    public record Jwt(String issuer, String jwkSetUri, String audience) {}
}
