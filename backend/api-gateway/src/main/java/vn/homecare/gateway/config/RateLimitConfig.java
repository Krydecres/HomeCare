package vn.homecare.gateway.config;

import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.Bucket4jLettuce;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.homecare.gateway.security.RateLimitFilter;

/** Wiring of {@link RateLimitFilter}: buckets live in the same Redis as the sessions (keys {@code rl:*}). */
@Configuration
public class RateLimitConfig {

    @Bean(destroyMethod = "shutdown")
    public RedisClient rateLimitRedisClient(
            @Value("${spring.data.redis.host:localhost}") String host,
            @Value("${spring.data.redis.port:6379}") int port,
            @Value("${spring.data.redis.password:}") String password) {
        RedisURI.Builder uri = RedisURI.builder().withHost(host).withPort(port).withTimeout(Duration.ofSeconds(2));
        if (!password.isBlank()) {
            uri.withPassword(password.toCharArray());
        }
        return RedisClient.create(uri.build());
    }

    @Bean
    public ProxyManager<byte[]> rateLimitBuckets(RedisClient rateLimitRedisClient) {
        return Bucket4jLettuce.casBasedBuilder(rateLimitRedisClient)
                .expirationAfterWrite(
                        ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofMinutes(1)))
                .build();
    }

    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilter(
            ProxyManager<byte[]> rateLimitBuckets,
            @Value("${homecare.rate-limit.api-per-minute:120}") long apiPerMinute,
            @Value("${homecare.rate-limit.sensitive-per-ten-minutes:10}") long sensitivePerTenMinutes) {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>(
                new RateLimitFilter(rateLimitBuckets, apiPerMinute, sensitivePerTenMinutes));
        // Spring Security's filter chain runs at order -100; run right after it so the account is known.
        registration.setOrder(-99);
        return registration;
    }
}
