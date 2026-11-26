package vn.homecare.identity.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Row of the admin user list (API-SV04-012). No profile/health data (US-13-003). */
public record AccountSummaryResponse(
        UUID id,
        String displayName,
        String phoneMasked,
        String emailMasked,
        String status,
        List<String> roles,
        String lockedReason,
        Instant createdAt) {}
