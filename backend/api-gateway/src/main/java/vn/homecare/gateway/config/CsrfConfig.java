package vn.homecare.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;

/**
 * CSRF for the SPA (US-15-008, R-08): the token lives in cookie {@code XSRF-TOKEN} (readable by JS, SameSite=Lax,
 * Secure) and must be echoed in header {@code X-XSRF-TOKEN} on every POST/PUT/PATCH/DELETE. The session cookie itself
 * stays HttpOnly. The token is not a credential: it is useless without the HttpOnly session cookie.
 */
@Configuration
public class CsrfConfig {

    public static final String COOKIE_NAME = "XSRF-TOKEN";
    public static final String HEADER_NAME = "X-XSRF-TOKEN";

    @Bean
    public CsrfTokenRepository csrfTokenRepository(
            @Value("${server.servlet.session.cookie.secure:true}") boolean secure) {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieName(COOKIE_NAME);
        repository.setHeaderName(HEADER_NAME);
        repository.setCookiePath("/");
        repository.setCookieCustomizer(cookie -> cookie.secure(secure).sameSite("Lax"));
        return repository;
    }
}
