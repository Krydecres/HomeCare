package vn.homecare.common.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import vn.homecare.common.outbox.OutboxEventRecorder;

class AuditEventRecorderTest {

    private final OutboxEventRecorder outbox = mock(OutboxEventRecorder.class);
    private final AuditEventRecorder recorder = new AuditEventRecorder(outbox);

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("TC-US-15-004-9: audit ghi actor từ JWT, role, hành động, lý do – qua outbox audit.recorded")
    void recordsActorFromJwt() {
        Jwt jwt = new Jwt(
                "t",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "RS256"),
                Map.of("sub", "kc-1", "accountId", "acc-9"));
        SecurityContextHolder.getContext()
                .setAuthentication(new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        UUID careRecipientId = UUID.randomUUID();

        recorder.record("HEALTH_PROFILE_VIEWED", "CareRecipient", careRecipientId, "Xử lý sự cố SOS");

        ArgumentCaptor<AuditEvent> event = ArgumentCaptor.forClass(AuditEvent.class);
        verify(outbox).record(eq("CareRecipient"), eq(careRecipientId), eq("audit.recorded"), event.capture());
        assertThat(event.getValue().actorId()).isEqualTo("acc-9");
        assertThat(event.getValue().actorRoles()).containsExactly("ADMIN");
        assertThat(event.getValue().reason()).isEqualTo("Xử lý sự cố SOS");
    }

    @Test
    void jobWithoutUserIsSystem() {
        recorder.record("PAYOUT_BATCH_CREATED", "PayoutBatch", UUID.randomUUID(), null);

        ArgumentCaptor<AuditEvent> event = ArgumentCaptor.forClass(AuditEvent.class);
        verify(outbox).record(any(), any(), eq("audit.recorded"), event.capture());
        assertThat(event.getValue().actorId()).isEqualTo("system");
    }
}
