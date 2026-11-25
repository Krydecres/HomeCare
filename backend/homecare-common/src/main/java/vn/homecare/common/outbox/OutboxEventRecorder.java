package vn.homecare.common.outbox;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;
import vn.homecare.common.event.EventEnvelope;
import vn.homecare.common.web.CorrelationIdFilter;

/**
 * Writes an event into {@code outbox_events} inside the caller's transaction (R-09). Call it from a ServiceImpl
 * method annotated with {@code @Transactional}; {@link OutboxPublisher} sends it to RabbitMQ afterwards.
 */
public class OutboxEventRecorder {

    private final OutboxEventRepository outboxEventRepository;
    private final JsonMapper jsonMapper;
    private final Clock clock;
    private final String producer;

    public OutboxEventRecorder(
            OutboxEventRepository outboxEventRepository, JsonMapper jsonMapper, Clock clock, String producer) {
        this.outboxEventRepository = outboxEventRepository;
        this.jsonMapper = jsonMapper;
        this.clock = clock;
        this.producer = producer;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public <T> EventEnvelope<T> record(String aggregateType, UUID aggregateId, String eventType, T payload) {
        Instant now = Instant.now(clock);
        UUID eventId = UuidV7.next(now);
        EventEnvelope<T> envelope = new EventEnvelope<>(
                eventId, eventType, now, producer, MDC.get(CorrelationIdFilter.MDC_KEY), 1, payload);
        String json = jsonMapper.writeValueAsString(envelope);
        outboxEventRepository.save(new OutboxEvent(eventId, aggregateType, aggregateId, eventType, json, now));
        return envelope;
    }
}
