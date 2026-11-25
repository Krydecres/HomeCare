package vn.homecare.common.audit;

import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.homecare.common.event.EventEnvelope;
import vn.homecare.common.outbox.OutboxEventRecorder;

/**
 * Records an audit fact in the same transaction as the change (Transactional Outbox → {@code audit.recorded} →
 * report-service). Call it from a ServiceImpl:
 *
 * <pre>{@code
 * auditEventRecorder.record("HEALTH_PROFILE_VIEWED", "CareRecipient", careRecipient.getId(), request.reason());
 * }</pre>
 *
 * The actor is taken from the JWT of the current request (claim {@code accountId}, else {@code sub}); a background job
 * without a user is recorded as {@code system}.
 */
public class AuditEventRecorder {

    public static final String EVENT_TYPE = "audit.recorded";

    private final OutboxEventRecorder outboxEventRecorder;

    public AuditEventRecorder(OutboxEventRecorder outboxEventRecorder) {
        this.outboxEventRecorder = outboxEventRecorder;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public EventEnvelope<AuditEvent> record(String action, String resourceType, UUID resourceId, String reason) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actorId = "system";
        List<String> roles = List.of();
        if (authentication instanceof JwtAuthenticationToken jwt) {
            String accountId = jwt.getToken().getClaimAsString("accountId");
            actorId = accountId != null ? accountId : jwt.getToken().getSubject();
            roles = jwt.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring("ROLE_".length()))
                    .toList();
        }
        AuditEvent event = new AuditEvent(actorId, roles, action, resourceType, resourceId, reason);
        return outboxEventRecorder.record(resourceType, resourceId, EVENT_TYPE, event);
    }
}
