package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** API-SV04-019 (US-14-003): the user re-confirms with an OTP (purpose REAUTH). */
public record DeleteAccountRequest(
        @NotBlank @Pattern(regexp = "[0-9]{6}") String otpCode) {}
