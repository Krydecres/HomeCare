package vn.homecare.common.outbox;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

/**
 * Time-ordered UUID version 7 (RFC 9562) for ids generated outside Hibernate (DD-0001). Entities use
 * {@code @UuidGenerator(style = UuidGenerator.Style.VERSION_7)} instead.
 */
final class UuidV7 {

    private static final SecureRandom RANDOM = new SecureRandom();

    private UuidV7() {}

    static UUID next(Instant now) {
        long millis = now.toEpochMilli();
        long randA = RANDOM.nextInt(1 << 12);
        long msb = (millis << 16) | (0x7L << 12) | randA;
        long lsb = (RANDOM.nextLong() & 0x3FFFFFFFFFFFFFFFL) | 0x8000000000000000L;
        return new UUID(msb, lsb);
    }
}
