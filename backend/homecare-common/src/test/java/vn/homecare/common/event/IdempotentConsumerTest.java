package vn.homecare.common.event;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

class IdempotentConsumerTest {

    private final ProcessedEventRepository repository = mock(ProcessedEventRepository.class);
    private final TransactionTemplate transactionTemplate = mock(TransactionTemplate.class);
    private final IdempotentConsumer consumer = new IdempotentConsumer(
            repository, transactionTemplate, Clock.fixed(Instant.parse("2026-11-24T00:00:00Z"), ZoneOffset.UTC));

    @SuppressWarnings("unchecked")
    private void runCallbacksInline() {
        when(transactionTemplate.execute(any()))
                .thenAnswer(inv -> ((TransactionCallback<Object>) inv.getArgument(0))
                        .doInTransaction(new SimpleTransactionStatus()));
    }

    @Test
    @DisplayName("TC-US-15-004-7: event mới thì chạy handler và ghi processed_events")
    void runsNewEvent() {
        runCallbacksInline();
        UUID eventId = UUID.randomUUID();
        AtomicInteger calls = new AtomicInteger();

        boolean ran = consumer.runOnce(eventId, "booking.payment.succeeded", calls::incrementAndGet);

        assertThat(ran).isTrue();
        assertThat(calls).hasValue(1);
        verify(repository).saveAndFlush(any(ProcessedEvent.class));
    }

    @Test
    @DisplayName("TC-US-15-004-8: event trùng thì bỏ qua")
    void skipsDuplicate() {
        runCallbacksInline();
        UUID eventId = UUID.randomUUID();
        when(repository.existsById(new ProcessedEventId(eventId, "c"))).thenReturn(true);
        AtomicInteger calls = new AtomicInteger();

        boolean ran = consumer.runOnce(eventId, "c", calls::incrementAndGet);

        assertThat(ran).isFalse();
        assertThat(calls).hasValue(0);
        verify(repository, never()).saveAndFlush(any());
    }
}
