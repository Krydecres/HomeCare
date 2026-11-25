package vn.homecare.common.outbox;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageBuilder;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Limit;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Job that reads unpublished rows of {@code outbox_events} and sends them to exchange {@code homecare.events} with
 * routing key = event_type (US-15-004). Delivery is at-least-once: consumers must use {@link
 * vn.homecare.common.event.IdempotentConsumer}.
 */
public class OutboxPublisher {

    public static final String EXCHANGE = "homecare.events";
    private static final int BATCH_SIZE = 100;
    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;
    private final TransactionTemplate transactionTemplate;
    private final Clock clock;

    public OutboxPublisher(
            OutboxEventRepository outboxEventRepository,
            RabbitTemplate rabbitTemplate,
            TransactionTemplate transactionTemplate,
            Clock clock) {
        this.outboxEventRepository = outboxEventRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.transactionTemplate = transactionTemplate;
        this.clock = clock;
    }

    @Scheduled(fixedDelayString = "${homecare.outbox.poll-interval:PT1S}")
    public void publishPending() {
        Integer sent = transactionTemplate.execute(status -> {
            List<OutboxEvent> batch = outboxEventRepository.findUnpublished(Limit.of(BATCH_SIZE));
            for (OutboxEvent event : batch) {
                rabbitTemplate.send(EXCHANGE, event.getEventType(), toMessage(event));
                event.markPublished(Instant.now(clock));
            }
            return batch.size();
        });
        if (sent != null && sent > 0) {
            log.debug("Published {} outbox events", sent);
        }
    }

    static Message toMessage(OutboxEvent event) {
        return MessageBuilder.withBody(event.getPayload().getBytes(StandardCharsets.UTF_8))
                .setContentType(MessageProperties.CONTENT_TYPE_JSON)
                .setContentEncoding(StandardCharsets.UTF_8.name())
                .setMessageId(event.getId().toString())
                .setType(event.getEventType())
                .setDeliveryMode(MessageDeliveryMode.PERSISTENT)
                .build();
    }
}
