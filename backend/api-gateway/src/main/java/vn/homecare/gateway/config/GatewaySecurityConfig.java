package vn.homecare.gateway.config;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProvider;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.oidc.authentication.OidcIdTokenDecoderFactory;
import org.springframework.security.oauth2.client.oidc.authentication.OidcIdTokenValidator;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoderFactory;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.savedrequest.NullRequestCache;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import vn.homecare.common.security.KeycloakRoleConverter;
import vn.homecare.gateway.security.KeycloakLogoutHandler;

/**
 * Security of the api-gateway acting as BFF (US-15-003, US-01-002, R-08, R-35). Security PR – TV1 must review.
 *
 * <ul>
 *   <li>Login: OAuth2 Authorization Code + PKCE with Keycloak client {@code homecare-bff}; tokens stay in the Redis
 *       session, the browser only gets cookie {@code HC_SESSION} (HttpOnly, Secure, SameSite=Lax).
 *   <li>Every {@code /api/**} call needs a session except the anonymous APIs of 10_API_Contract; {@code /internal/**}
 *       is never exposed. Unauthenticated API calls get 401 ProblemDetail {@code SESSION_EXPIRED} instead of a redirect.
 *   <li>CSRF: cookie {@code XSRF-TOKEN} + header {@code X-XSRF-TOKEN}. Only the payment provider callbacks
 *       (server-to-server, verified by signature in payment-service) are exempt.
 *   <li>Headers: CSP, HSTS, nosniff, frame deny, referrer policy.
 * </ul>
 */
@Configuration
@EnableWebSecurity
public class GatewaySecurityConfig {

    /** API-SV04-001..003, API-SV07-001/002/009, API-SV11-002/003: role "Khách vãng lai" in 10_API_Contract. */
    static final String[] ANONYMOUS_GET = {
        "/api/v1/services", "/api/v1/services/*", "/api/v1/service-areas", "/api/v1/payments/vnpay/ipn"
    };

    static final String[] ANONYMOUS_POST = {
        "/api/v1/otp", "/api/v1/accounts/customers", "/api/v1/accounts/password-reset", "/api/v1/payments/momo/ipn"
    };

    /** Server-to-server callbacks: no browser, no cookie, so no CSRF token; signature checked by payment-service. */
    static final String[] PAYMENT_CALLBACKS = {"/api/v1/payments/vnpay/ipn", "/api/v1/payments/momo/ipn"};

    static final String CONTENT_SECURITY_POLICY =
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
                    + "img-src 'self' data: blob: https://*.tile.openstreetmap.org; font-src 'self'; connect-src 'self'; "
                    + "worker-src 'self'; manifest-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; "
                    + "form-action 'self'";

    private static final String SESSION_EXPIRED_BODY =
            "{\"type\":\"about:blank\",\"title\":\"Unauthorized\",\"status\":401,"
                    + "\"detail\":\"Phiên đăng nhập đã hết hạn\",\"errorCode\":\"SESSION_EXPIRED\"}";

    @Bean
    public SecurityFilterChain gatewaySecurityFilterChain(
            HttpSecurity http,
            ClientRegistrationRepository clientRegistrationRepository,
            CsrfTokenRepository csrfTokenRepository,
            KeycloakLogoutHandler keycloakLogoutHandler,
            @Value("${springdoc.api-docs.enabled:false}") boolean swaggerEnabled)
            throws Exception {
        http.authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info")
                            .permitAll()
                            .requestMatchers("/oauth2/authorization/**", "/login/oauth2/code/**", "/error")
                            .permitAll()
                            .requestMatchers(HttpMethod.GET, ANONYMOUS_GET)
                            .permitAll()
                            .requestMatchers(HttpMethod.POST, ANONYMOUS_POST)
                            .permitAll()
                            .requestMatchers("/internal/**")
                            .denyAll();
                    if (swaggerEnabled) {
                        // UI shell and the gateway's own spec only; service specs go through routes and need a session.
                        auth.requestMatchers(
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/v3/api-docs",
                                        "/v3/api-docs/swagger-config")
                                .permitAll();
                    }
                    auth.anyRequest().authenticated();
                })
                .oauth2Login(login -> login.authorizationEndpoint(endpoint ->
                                endpoint.authorizationRequestResolver(pkceResolver(clientRegistrationRepository)))
                        .userInfoEndpoint(userInfo -> userInfo.userAuthoritiesMapper(keycloakRolesMapper()))
                        .defaultSuccessUrl("/", true))
                // Anonymous calls must not create Redis sessions; after login we always land on "/" anyway.
                .requestCache(cache -> cache.requestCache(new NullRequestCache()))
                .exceptionHandling(exceptions -> exceptions.defaultAuthenticationEntryPointFor(
                        sessionExpiredEntryPoint(),
                        PathPatternRequestMatcher.withDefaults().matcher("/api/**")))
                .csrf(csrf ->
                        csrf.spa().csrfTokenRepository(csrfTokenRepository).ignoringRequestMatchers(PAYMENT_CALLBACKS))
                .addFilterAfter(csrfCookieFilter(), CsrfFilter.class)
                .logout(logout -> logout.logoutUrl("/logout")
                        .addLogoutHandler(keycloakLogoutHandler)
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT))
                        .deleteCookies("HC_SESSION", CsrfConfig.COOKIE_NAME))
                .headers(headers -> headers.contentSecurityPolicy(csp -> csp.policyDirectives(CONTENT_SECURITY_POLICY))
                        .httpStrictTransportSecurity(
                                hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31_536_000))
                        .referrerPolicy(referrer -> referrer.policy(
                                ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .frameOptions(frame -> frame.deny()));
        return http.build();
    }

    /** Validates ID tokens: signature, aud = homecare-bff, exp/iat (OidcIdTokenValidator) and the realm issuer. */
    @Bean
    public JwtDecoderFactory<ClientRegistration> idTokenDecoderFactory(
            @Value("${homecare.security.jwt.issuer}") String expectedIssuer) {
        OidcIdTokenDecoderFactory factory = new OidcIdTokenDecoderFactory();
        factory.setJwtValidatorFactory(registration -> new DelegatingOAuth2TokenValidator<>(
                new OidcIdTokenValidator(registration), new JwtIssuerValidator(expectedIssuer)));
        return factory;
    }

    /** Used by the TokenRelay filter: refreshes the short-lived access token (≤ 5 min, US-15-007) transparently. */
    @Bean
    public OAuth2AuthorizedClientManager authorizedClientManager(
            ClientRegistrationRepository clientRegistrationRepository,
            OAuth2AuthorizedClientRepository authorizedClientRepository) {
        OAuth2AuthorizedClientProvider provider = OAuth2AuthorizedClientProviderBuilder.builder()
                .authorizationCode()
                .refreshToken()
                .build();
        DefaultOAuth2AuthorizedClientManager manager =
                new DefaultOAuth2AuthorizedClientManager(clientRegistrationRepository, authorizedClientRepository);
        manager.setAuthorizedClientProvider(provider);
        return manager;
    }

    private static DefaultOAuth2AuthorizationRequestResolver pkceResolver(ClientRegistrationRepository repository) {
        DefaultOAuth2AuthorizationRequestResolver resolver =
                new DefaultOAuth2AuthorizationRequestResolver(repository, "/oauth2/authorization");
        resolver.setAuthorizationRequestCustomizer(OAuth2AuthorizationRequestCustomizers.withPkce());
        return resolver;
    }

    /** Realm roles from the ID token / userinfo become ROLE_* (same mapping as every service). */
    private static GrantedAuthoritiesMapper keycloakRolesMapper() {
        return authorities -> {
            Set<GrantedAuthority> mapped = new HashSet<>(authorities);
            for (GrantedAuthority authority : authorities) {
                if (authority instanceof OidcUserAuthority oidc) {
                    mapped.addAll(KeycloakRoleConverter.toAuthorities(
                            KeycloakRoleConverter.extractRoles(oidc.getIdToken().getClaims())));
                    if (oidc.getUserInfo() != null) {
                        mapped.addAll(KeycloakRoleConverter.toAuthorities(KeycloakRoleConverter.extractRoles(
                                oidc.getUserInfo().getClaims())));
                    }
                }
            }
            return mapped;
        };
    }

    private static AuthenticationEntryPoint sessionExpiredEntryPoint() {
        return (request, response, exception) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write(SESSION_EXPIRED_BODY);
        };
    }

    /** Loads the deferred CSRF token on every request so cookie XSRF-TOKEN is always present for the SPA. */
    private static Filter csrfCookieFilter() {
        return (request, response, chain) -> {
            if (request.getAttribute(CsrfToken.class.getName()) instanceof CsrfToken token) {
                token.getToken();
            }
            chain.doFilter(request, response);
        };
    }
}
