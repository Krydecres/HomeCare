package vn.homecare.gateway.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.redis.lettuce.Bucket4jLettuce;
import io.lettuce.core.RedisClient;
import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Integration test with a real Redis (Testcontainers) – R-20. */
@Testcontainers
class RateLimitFilterIntegrationTest {

    @Container
    static final GenericContainer<?> REDIS = new GenericContainer<>("redis:7.4-alpine").withExposedPorts(6379);

    private static RedisClient client;
    private static RateLimitFilter filter;

    @BeforeAll
    static void setUp() {
        client = RedisClient.create("redis://" + REDIS.getHost() + ":" + REDIS.getMappedPort(6379));
        var buckets = Bucket4jLettuce.casBasedBuilder(client)
                .expirationAfterWrite(
                        ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofMinutes(1)))
                .build();
        filter = new RateLimitFilter(buckets, 3, 2);
    }

    @AfterAll
    static void tearDown() {
        client.shutdown();
    }

    private static MockHttpServletResponse call(String method, String path, String ip) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setRemoteAddr(ip);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    @Test
    @DisplayName("TC-US-15-003-8: gửi OTP quá giới hạn theo IP → 429 RATE_LIMITED + Retry-After")
    void sensitivePostIsLimitedPerIp() throws Exception {
        String ip = "10.0." + UUID.randomUUID().hashCode() % 200 + ".1";
        assertThat(call("POST", "/api/v1/otp", ip).getStatus()).isEqualTo(200);
        assertThat(call("POST", "/api/v1/otp", ip).getStatus()).isEqualTo(200);

        MockHttpServletResponse blocked = call("POST", "/api/v1/otp", ip);

        assertThat(blocked.getStatus()).isEqualTo(429);
        assertThat(blocked.getContentAsString()).contains("RATE_LIMITED");
        assertThat(Long.parseLong(blocked.getHeader("Retry-After"))).isPositive();
        assertThat(call("POST", "/api/v1/otp", "192.168.99.99").getStatus())
                .as("another IP has its own bucket")
                .isEqualTo(200);
    }

    @Test
    @DisplayName("TC-US-15-003-9: API thường bị giới hạn theo phút; đường dẫn ngoài /api không tính")
    void apiCallsAreLimited() throws Exception {
        String ip = "172.16.0." + Math.abs(UUID.randomUUID().hashCode() % 250);
        for (int i = 0; i < 3; i++) {
            assertThat(call("GET", "/api/v1/bookings", ip).getStatus()).isEqualTo(200);
        }
        assertThat(call("GET", "/api/v1/bookings", ip).getStatus()).isEqualTo(429);
        assertThat(call("GET", "/actuator/health", ip).getStatus()).isEqualTo(200);
    }
}
