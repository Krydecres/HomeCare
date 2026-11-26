package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** API-SV04-003 (US-01-003). */
public record ResetPasswordRequest(
        @NotBlank @Size(max = 254) String destination,
        @NotBlank @Pattern(regexp = "[0-9]{6}") String otpCode,
        @NotBlank @Size(min = 8, max = 128) String newPassword) {}
