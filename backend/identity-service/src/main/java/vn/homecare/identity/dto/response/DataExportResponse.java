package vn.homecare.identity.dto.response;

import java.time.Instant;
import java.util.UUID;

/** API-SV04-018/023 (US-14-002). {@code downloadUrl} only when READY, valid until {@code expiresAt} (7 days). */
public record DataExportResponse(UUID id, String status, Instant requestedAt, Instant expiresAt, String downloadUrl) {}
