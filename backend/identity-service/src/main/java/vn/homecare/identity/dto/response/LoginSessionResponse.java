package vn.homecare.identity.dto.response;

import java.time.Instant;

/** API-SV04-006 (US-01-006). {@code sessionId} = Keycloak SSO session id. */
public record LoginSessionResponse(
        String sessionId, String browser, String os, Instant startedAt, Instant lastActiveAt, boolean current) {}
