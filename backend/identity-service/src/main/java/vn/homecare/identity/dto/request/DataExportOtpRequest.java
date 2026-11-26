package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** API-SV04-018 (US-14-002): re-authentication by OTP (purpose REAUTH) before exporting personal data. */
public record DataExportOtpRequest(
        @NotBlank @Pattern(regexp = "[0-9]{6}") String otpCode) {}
