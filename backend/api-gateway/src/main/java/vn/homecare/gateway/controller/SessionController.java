package vn.homecare.gateway.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.DeferredCsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.homecare.gateway.dto.response.SessionResponse;

/** BFF session endpoint (API-SV01-003, US-01-002, US-01-009). Anonymous calls get 401 SESSION_EXPIRED. */
@RestController
@RequestMapping("/api/v1/me")
public class SessionController {

    private final CsrfTokenRepository csrfTokenRepository;

    public SessionController(CsrfTokenRepository csrfTokenRepository) {
        this.csrfTokenRepository = csrfTokenRepository;
    }

    @Operation(summary = "Thông tin phiên đăng nhập hiện tại", operationId = "getSession")
    @GetMapping("/session")
    @PreAuthorize("isAuthenticated()")
    public SessionResponse getSession(@AuthenticationPrincipal OidcUser user, HttpServletRequest request) {
        // Raw (unmasked) token: the same value as cookie XSRF-TOKEN, which the SPA echoes in X-XSRF-TOKEN.
        CsrfToken csrf = request.getAttribute(DeferredCsrfToken.class.getName()) instanceof DeferredCsrfToken deferred
                ? deferred.get()
                : csrfTokenRepository.loadToken(request);
        return SessionResponse.of(user, csrf == null ? null : csrf.getToken());
    }
}
