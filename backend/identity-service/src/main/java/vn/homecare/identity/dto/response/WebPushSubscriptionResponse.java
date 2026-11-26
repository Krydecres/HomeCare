package vn.homecare.identity.dto.response;

import java.time.Instant;
import java.util.UUID;

/** API-SV04-008. */
public record WebPushSubscriptionResponse(UUID id, Instant createdAt) {}
