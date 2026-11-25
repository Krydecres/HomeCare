package vn.homecare.gateway.security;

import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rate limit at the gateway with Bucket4j + Redis (US-15-003, 02_Tech_Stack): shared by every gateway instance.
 *
 * <ul>
 *   <li>Sensitive anonymous POSTs (OTP, register, password reset – API-SV04-001..003): per client IP, against OTP spam
 *       and brute force.
 *   <li>Every other {@code /api/**} call and the login redirect: per logged-in account (OIDC {@code sub}) or per IP.
 * </ul>
 *
 * Over the limit: 429 ProblemDetail {@code RATE_LIMITED} + {@code Retry-After}. If Redis is unreachable the request is let
 * through (fail-open) and logged, because the session store is down anyway and blocking everyone would be worse.
 * Registered after the Spring Security chain so the authenticated account is known.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    static final Set<String> SENSITIVE_POST =
            Set.of("/api/v1/otp", "/api/v1/accounts/customers", "/api/v1/accounts/password-reset");

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final String BODY = "{\"type\":\"about:blank\",\"title\":\"Too Many Requests\",\"status\":429,"
            + "\"detail\":\"Bạn thao tác quá nhanh, vui lòng thử lại sau\",\"errorCode\":\"RATE_LIMITED\"}";

    private final ProxyManager<byte[]> buckets;
    private final BucketConfiguration apiLimit;
    private final BucketConfiguration sensitiveLimit;

    public RateLimitFilter(ProxyManager<byte[]> buckets, long apiPerMinute, long sensitivePerTenMinutes) {
        this.buckets = buckets;
        this.apiLimit = BucketConfiguration.builder()
                .addLimit(limit -> limit.capacity(apiPerMinute).refillGreedy(apiPerMinute, Duration.ofMinutes(1)))
                .build();
        this.sensitiveLimit = BucketConfiguration.builder()
                .addLimit(limit -> limit.capacity(sensitivePerTenMinutes)
                        .refillIntervally(sensitivePerTenMinutes, Duration.ofMinutes(10)))
                .build();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.startsWith("/api/") || path.startsWith("/oauth2/authorization/"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        boolean sensitive = "POST".equals(request.getMethod()) && SENSITIVE_POST.contains(request.getRequestURI());
        String key = sensitive ? "rl:sensitive:ip:" + request.getRemoteAddr() : "rl:api:" + clientKey(request);
        ConsumptionProbe probe;
        try {
            probe = buckets.builder()
                    .build(key.getBytes(StandardCharsets.UTF_8), () -> sensitive ? sensitiveLimit : apiLimit)
                    .tryConsumeAndReturnRemaining(1);
        } catch (RuntimeException e) {
            log.warn("Rate limit store unavailable, letting request through: {}", e.getMessage());
            chain.doFilter(request, response);
            return;
        }
        if (probe.isConsumed()) {
            response.setHeader("X-RateLimit-Remaining", Long.toString(probe.getRemainingTokens()));
            chain.doFilter(request, response);
            return;
        }
        long retryAfter = Math.max(1, TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill()));
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("Retry-After", Long.toString(retryAfter));
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(BODY);
    }

    private static String clientKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof OAuth2AuthenticationToken token) {
            return "user:" + token.getName();
        }
        return "ip:" + request.getRemoteAddr();
    }
}
