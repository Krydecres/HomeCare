package vn.homecare.gateway.controller;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import vn.homecare.gateway.config.CsrfConfig;
import vn.homecare.gateway.config.GatewaySecurityConfig;
import vn.homecare.gateway.security.KeycloakLogoutHandler;

/** Security behaviour of the BFF (US-15-003, US-01-002). Security test – keep in sync with GatewaySecurityConfig. */
@WebMvcTest(SessionController.class)
@Import({GatewaySecurityConfig.class, CsrfConfig.class, KeycloakLogoutHandler.class})
@TestPropertySource(
        properties = {
            "spring.security.oauth2.client.registration.keycloak.client-id=homecare-bff",
            "spring.security.oauth2.client.registration.keycloak.client-secret=test-only",
            "spring.security.oauth2.client.registration.keycloak.authorization-grant-type=authorization_code",
            "spring.security.oauth2.client.registration.keycloak.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}",
            "spring.security.oauth2.client.registration.keycloak.scope=openid",
            "spring.security.oauth2.client.provider.keycloak.authorization-uri=http://kc.test/auth",
            "spring.security.oauth2.client.provider.keycloak.token-uri=http://kc.test/token",
            "spring.security.oauth2.client.provider.keycloak.jwk-set-uri=http://kc.test/certs",
            "homecare.security.jwt.issuer=http://kc.test/realms/homecare",
            "springdoc.api-docs.enabled=false"
        })
class SessionControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    @DisplayName("TC-US-01-002-1: chưa đăng nhập gọi /api/v1/me/session → 401 SESSION_EXPIRED, không redirect")
    void anonymousGets401() throws Exception {
        mvc.perform(get("/api/v1/me/session"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("SESSION_EXPIRED"))
                .andExpect(result -> org.assertj.core.api.Assertions.assertThat(
                                result.getRequest().getSession(false))
                        .as("anonymous API call must not create a session")
                        .isNull());
    }

    @Test
    @DisplayName("TC-US-01-002-2: đã đăng nhập → trả roles, không có token nào trong body")
    void returnsSessionWithoutTokens() throws Exception {
        mvc.perform(get("/api/v1/me/session")
                        .with(oidcLogin()
                                .idToken(token -> token.claim("name", "Phạm Minh Tuấn")
                                        .claim("roles", List.of("CUSTOMER", "CAREGIVER", "offline_access"))
                                        .claim("accountId", "0193f0a2-0000-7000-8000-000000000001"))
                                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Phạm Minh Tuấn"))
                .andExpect(jsonPath("$.roles[0]").value("CUSTOMER"))
                .andExpect(jsonPath("$.roles[1]").value("CAREGIVER"))
                .andExpect(jsonPath("$.roles.length()").value(2))
                .andExpect(jsonPath("$.accountId").value("0193f0a2-0000-7000-8000-000000000001"))
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.idToken").doesNotExist());
    }

    @Test
    @DisplayName("TC-US-15-003-5: trang web chưa đăng nhập → chuyển tới đăng nhập Keycloak")
    void pageRedirectsToLogin() throws Exception {
        mvc.perform(get("/some-page").accept(MediaType.TEXT_HTML))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", containsString("/oauth2/authorization/keycloak")));
    }

    @Test
    @DisplayName("TC-US-15-003-6: /internal/** không bao giờ mở ra ngoài, kể cả ADMIN")
    void internalApisAreBlocked() throws Exception {
        mvc.perform(get("/internal/v1/accounts/1/roles")
                        .with(oidcLogin().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("TC-US-01-002-3: đăng xuất thiếu CSRF token → 403")
    void logoutNeedsCsrf() throws Exception {
        mvc.perform(post("/logout").with(oidcLogin())).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("TC-US-01-002-4: đăng xuất gửi lại cookie XSRF-TOKEN trong header X-XSRF-TOKEN (như SPA) → 204")
    void logoutWithCsrf() throws Exception {
        mvc.perform(post("/logout")
                        .with(oidcLogin())
                        .cookie(new Cookie(CsrfConfig.COOKIE_NAME, "spa-token"))
                        .header(CsrfConfig.HEADER_NAME, "spa-token"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("TC-US-01-002-5: header CSRF không khớp cookie → 403")
    void logoutWithWrongCsrf() throws Exception {
        mvc.perform(post("/logout")
                        .with(oidcLogin())
                        .cookie(new Cookie(CsrfConfig.COOKIE_NAME, "spa-token"))
                        .header(CsrfConfig.HEADER_NAME, "forged"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("TC-US-15-003-7: có CSP, HSTS (trên HTTPS), nosniff, chặn iframe")
    void securityHeaders() throws Exception {
        mvc.perform(get("/api/v1/me/session").secure(true))
                .andExpect(header().string("Content-Security-Policy", containsString("default-src 'self'")))
                .andExpect(header().string("Content-Security-Policy", containsString("frame-ancestors 'none'")))
                .andExpect(header().exists("Strict-Transport-Security"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"));
    }

    @Test
    @DisplayName("TC-US-15-008-1: cookie XSRF-TOKEN được cấp cho SPA")
    void issuesCsrfCookie() throws Exception {
        mvc.perform(get("/api/v1/me/session"))
                .andExpect(header().string("Set-Cookie", containsString(CsrfConfig.COOKIE_NAME + "=")));
    }
}
