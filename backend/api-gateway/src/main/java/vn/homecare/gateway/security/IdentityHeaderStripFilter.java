package vn.homecare.gateway.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Removes identity headers sent by the client before anything else sees the request (US-15-003, SC-047): {@code
 * X-User-*}, {@code X-Role*}, {@code X-Forwarded-User} and {@code Authorization}. Services trust only the JWT that the
 * gateway relays from the server-side session; a browser never sends its own token (R-08).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class IdentityHeaderStripFilter extends OncePerRequestFilter {

    static boolean isStripped(String headerName) {
        String name = headerName.toLowerCase(Locale.ROOT);
        return name.startsWith("x-user-")
                || name.startsWith("x-role")
                || name.equals("x-forwarded-user")
                || name.equals("authorization");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        chain.doFilter(new StrippedRequest(request), response);
    }

    private static final class StrippedRequest extends HttpServletRequestWrapper {

        StrippedRequest(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getHeader(String name) {
            return isStripped(name) ? null : super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            return isStripped(name) ? Collections.emptyEnumeration() : super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            List<String> names = Collections.list(super.getHeaderNames());
            names.removeIf(IdentityHeaderStripFilter::isStripped);
            return Collections.enumeration(names);
        }
    }
}
