package vn.homecare.identity.dto.response;

/** API-SV04-001: same answer whether or not the destination exists (US-01-003). */
public record OtpSentResponse(String maskedDestination, long expiresInSeconds) {}
