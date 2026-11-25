package vn.homecare.common.it;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import vn.homecare.common.event.IdempotentConsumer;
import vn.homecare.common.outbox.OutboxEventRecorder;
import vn.homecare.common.outbox.OutboxPublisher;

/**
 * Transactional Outbox + idempotent consumer against a real PostgreSQL/PostGIS with the same Flyway migration every
 * service ships (R-09, R-20, US-15-004). RabbitMQ is mocked: here we check what is sent, not the broker.
 */
@Testcontainers
@SpringBootTest(
        classes = OutboxIntegrationTest.App.class,
        properties = {
            "spring.main.web-application-type=none",
            "spring.application.name=test-service",
            "spring.jpa.hibernate.ddl-auto=validate",
            "homecare.outbox.poll-interval=PT1H"
        })
class OutboxIntegrationTest {

    @SpringBootApplication
    static class App {}

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer(
            DockerImageName.parse("postgis/postgis:17-3.5").asCompatibleSubstituteFor("postgres"));

    @MockitoBean
    RabbitTemplate rabbitTemplate;

    @Autowired
    OutboxEventRecorder recorder;

    @Autowired
    OutboxPublisher publisher;

    @Autowired
    IdempotentConsumer idempotentConsumer;

    @Autowired
    TransactionTemplate tx;

    @Autowired
    JdbcTemplate jdbc;

    @Test
    @DisplayName("TC-US-15-004-10: event ghi vào outbox cùng transaction, job gửi đúng 1 lần tới homecare.events")
    void recordsAndPublishesOnce() {
        UUID bookingId = UUID.randomUUID();
        tx.executeWithoutResult(
                s -> recorder.record("Booking", bookingId, "booking.created", Map.of("bookingId", bookingId)));

        assertThat(jdbc.queryForObject(
                        "select count(*) from outbox_events where aggregate_id = ? and published_at is null",
                        Integer.class,
                        bookingId))
                .isEqualTo(1);

        publisher.publishPending();
        publisher.publishPending();

        verify(rabbitTemplate, times(1)).send(eq("homecare.events"), eq("booking.created"), any(Message.class));
        assertThat(jdbc.queryForObject(
                        "select count(*) from outbox_events where aggregate_id = ? and published_at is not null",
                        Integer.class,
                        bookingId))
                .isEqualTo(1);
        assertThat(jdbc.queryForObject(
                        "select payload->>'eventType' from outbox_events where aggregate_id = ?",
                        String.class,
                        bookingId))
                .isEqualTo("booking.created");
    }

    @Test
    @DisplayName("TC-US-15-004-11: ghi event ngoài transaction bị từ chối (tránh mất event)")
    void requiresTransaction() {
        assertThatThrownBy(() -> recorder.record("Booking", UUID.randomUUID(), "booking.created", Map.of()))
                .isInstanceOf(IllegalTransactionStateException.class);
    }

    @Test
    @DisplayName("TC-US-15-004-12: rollback thì không có event")
    void rollbackLeavesNoEvent() {
        UUID id = UUID.randomUUID();
        tx.executeWithoutResult(s -> {
            recorder.record("Booking", id, "booking.cancelled", Map.of());
            s.setRollbackOnly();
        });
        assertThat(jdbc.queryForObject("select count(*) from outbox_events where aggregate_id = ?", Integer.class, id))
                .isZero();
    }

    @Test
    @DisplayName("TC-US-15-004-13: consumer nhận trùng event chỉ xử lý 1 lần (processed_events)")
    void consumerIsIdempotent() {
        UUID eventId = UUID.randomUUID();
        AtomicInteger handled = new AtomicInteger();

        boolean first = idempotentConsumer.runOnce(eventId, "booking.payment.succeeded", handled::incrementAndGet);
        boolean second = idempotentConsumer.runOnce(eventId, "booking.payment.succeeded", handled::incrementAndGet);
        boolean otherConsumer =
                idempotentConsumer.runOnce(eventId, "notification.payment.succeeded", handled::incrementAndGet);

        assertThat(first).isTrue();
        assertThat(second).isFalse();
        assertThat(otherConsumer).isTrue();
        assertThat(handled).hasValue(2);
    }
}
