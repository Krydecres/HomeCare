package vn.homecare.common.event;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Runs an event handler at most once per (eventId, consumer), R-09.
 *
 * <p>The marker row in {@code processed_events} and the handler's own writes share one transaction, so a crash keeps
 * both or neither. A concurrent duplicate delivery fails on the primary key and is rolled back.
 *
 * <pre>{@code
 * @RabbitListener(queues = "booking.dispatch.assigned")
 * void onAssigned(EventEnvelope<DispatchAssignedPayload> event) {
 *     idempotentConsumer.runOnce(event.eventId(), "booking.dispatch.assigned", () -> bookingService.assign(...));
 * }
 * }</pre>
 */
public class IdempotentConsumer {

    private static final Logger log = LoggerFactory.getLogger(IdempotentConsumer.class);

    private final ProcessedEventRepository processedEventRepository;
    private final TransactionTemplate transactionTemplate;
    private final Clock clock;

    public IdempotentConsumer(
            ProcessedEventRepository processedEventRepository, TransactionTemplate transactionTemplate, Clock clock) {
        this.processedEventRepository = processedEventRepository;
        this.transactionTemplate = transactionTemplate;
        this.clock = clock;
    }

    /** Returns {@code true} if the action ran, {@code false} if this consumer already processed the event. */
    public boolean runOnce(UUID eventId, String consumer, Runnable action) {
        Boolean ran = transactionTemplate.execute(status -> {
            if (processedEventRepository.existsById(new ProcessedEventId(eventId, consumer))) {
                log.debug("Skip duplicate event {} for consumer {}", eventId, consumer);
                return false;
            }
            processedEventRepository.saveAndFlush(new ProcessedEvent(eventId, consumer, Instant.now(clock)));
            action.run();
            return true;
        });
        return Boolean.TRUE.equals(ran);
    }
}
