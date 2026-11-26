package vn.homecare.identity.service;

import vn.homecare.identity.dto.request.SendOtpRequest;
import vn.homecare.identity.dto.response.OtpSentResponse;
import vn.homecare.identity.entity.OtpPurpose;

/** One-time codes for registration, password reset and re-authentication (US-01-001, US-01-003, US-14-002/003). */
public interface OtpService {

    /**
     * Sends a code. For {@code REAUTH} the destination is always the logged-in user's own phone/email
     * ({@code keycloakUserId} must be given); the request destination is ignored.
     */
    OtpSentResponse send(SendOtpRequest request, String keycloakUserId);

    /** Consumes a valid code or throws OTP_INVALID / OTP_LOCKED. */
    void verify(String destination, OtpPurpose purpose, String code);

    /** Phone without spaces, email lower-case. */
    static String normalize(String destination) {
        String trimmed = destination == null ? "" : destination.trim();
        return trimmed.contains("@") ? trimmed.toLowerCase(java.util.Locale.ROOT) : trimmed.replaceAll("[\\s.-]", "");
    }
}
