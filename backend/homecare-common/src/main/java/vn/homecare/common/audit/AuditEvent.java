package vn.homecare.common.audit;

import java.util.List;
import java.util.UUID;

/**
 * Payload of event {@code audit.recorded} (EventEnvelope.payload) consumed by report-service into its central audit log
 * (US-13-004, 02_Tech_Stack "Audit"). Who did what to which record, and why – never the data itself (R-17).
 *
 * @param actorId accountId (or Keycloak sub) of the user/service account that acted
 * @param actorRoles realm roles of the actor at that moment
 * @param action UPPER_SNAKE_CASE verb, e.g. {@code HEALTH_PROFILE_VIEWED}, {@code PAYOUT_APPROVED}
 * @param resourceType entity name, e.g. {@code CareRecipient}
 * @param resourceId id of the record touched
 * @param reason mandatory for sensitive reads by staff (US-14-005), otherwise null
 */
public record AuditEvent(
        String actorId, List<String> actorRoles, String action, String resourceType, UUID resourceId, String reason) {}
