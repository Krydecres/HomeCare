package vn.homecare.common.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Standard envelope for every event published on exchange {@code homecare.events} (NM-0101, US-15-004).
 *
 * <p>The payload must only carry IDs and non-sensitive fields, never health data or personal data in clear text
 * (DD-0006).
 *
 * @param eventId unique id, used by consumers for idempotency (processed_events)
 * @param eventType routing key, e.g. {@code booking.created}
 * @param occurredAt UTC instant the business fact happened
 * @param producer spring.application.name of the producing service
 * @param correlationId X-Correlation-Id of the request that caused the event
 * @param version payload schema version, starts at 1
 * @param payload event-specific body
 */
public record EventEnvelope<T>(
        UUID eventId,
        String eventType,
        Instant occurredAt,
        String producer,
        String correlationId,
        int version,
        T payload) {}
