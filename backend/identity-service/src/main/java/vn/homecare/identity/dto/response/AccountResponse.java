package vn.homecare.identity.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Account seen by its owner or an admin. Contact data is masked (R-17). {@code inviteEmailSent} is only set when an
 * admin creates an internal account (US-01-007).
 */
public record AccountResponse(
        UUID id,
        String displayName,
        String phoneMasked,
        String emailMasked,
        String status,
        List<String> roles,
        UUID partnerOrgId,
        Instant createdAt,
        Instant deletionScheduledAt,
        Boolean inviteEmailSent) {}
