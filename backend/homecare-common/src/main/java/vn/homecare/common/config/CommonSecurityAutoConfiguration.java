package vn.homecare.common.config;

import java.util.List;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import vn.homecare.common.security.EncryptedStringConverter;
import vn.homecare.common.security.HomecareSecurityProperties;
import vn.homecare.common.security.KeycloakRoleConverter;
import vn.homecare.common.security.LookupHasher;

/**
 * Default security of every business service (US-15-003, R-35): OAuth2 Resource Server that only trusts a Keycloak JWT
 * (never X-User-* headers), checks signature (JWKS, RS256 only), issuer, audience and expiry, maps realm roles to
 * {@code ROLE_*} and enables {@code @PreAuthorize}. Every request except health probes must be authenticated; the
 * fine-grained rule per endpoint lives in {@code @PreAuthorize} on the controller (13_RBAC).
 *
 * <p>CSRF: services are stateless, accept only {@code Authorization: Bearer} from the gateway on the internal Docker
 * network and never use cookies, so CSRF protection is enforced at the api-gateway (BFF, cookie session) and switched
 * off here. Reviewed by TV1 (security lead) – do not copy this into the gateway.
 */
@AutoConfiguration
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE + 10)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnClass({JwtDecoder.class, SecurityFilterChain.class})
@EnableConfigurationProperties(HomecareSecurityProperties.class)
@EnableMethodSecurity
public class CommonSecurityAutoConfiguration {

    private static final String[] PUBLIC_PROBES = {"/actuator/health", "/actuator/health/**", "/actuator/info"};

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = "homecare.security.jwt", name = "jwk-set-uri")
    public JwtDecoder jwtDecoder(HomecareSecurityProperties properties) {
        HomecareSecurityProperties.Jwt jwt = properties.jwt();
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwt.jwkSetUri())
                .jwsAlgorithm(SignatureAlgorithm.RS256)
                .build();
        OAuth2TokenValidator<Jwt> audience = new JwtClaimValidator<List<String>>(
                JwtClaimNames.AUD, aud -> aud != null && aud.contains(jwt.audience()));
        decoder.setJwtValidator(
                new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(jwt.issuer()), audience));
        return decoder;
    }

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain resourceServerSecurityFilterChain(
            HttpSecurity http, HomecareSecurityProperties properties) throws Exception {
        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        List<String> publicEndpoints = properties.publicEndpoints() == null ? List.of() : properties.publicEndpoints();
        http.authorizeHttpRequests(auth -> {
                    auth.requestMatchers(PUBLIC_PROBES).permitAll();
                    for (String endpoint : publicEndpoints) {
                        String[] parts = endpoint.trim().split(" +", 2);
                        auth.requestMatchers(HttpMethod.valueOf(parts[0]), parts[1])
                                .permitAll();
                    }
                    auth.anyRequest().authenticated();
                })
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(j -> j.jwtAuthenticationConverter(authenticationConverter)))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable());
        return http.build();
    }

    @Bean
    @ConditionalOnMissingBean
    public LookupHasher lookupHasher(HomecareSecurityProperties properties) {
        return new LookupHasher(properties.lookupHashKey());
    }

    /** Separate class so that apps without JPA (api-gateway) never load AttributeConverter. */
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(name = "jakarta.persistence.AttributeConverter")
    static class ColumnEncryptionConfiguration {

        @Bean
        @ConditionalOnMissingBean
        public EncryptedStringConverter encryptedStringConverter(HomecareSecurityProperties properties) {
            return new EncryptedStringConverter(properties.encryptionKey());
        }
    }
}
