package vn.homecare.identity.dto.response;

import java.time.Instant;

/** API-SV04-019 (US-14-003): data is anonymized at {@code scheduledAt} (30 days later) unless cancelled. */
public record AccountDeletionResponse(String status, Instant scheduledAt) {}
