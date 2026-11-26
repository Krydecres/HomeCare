package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * API-SV04-002 (US-01-001). Has NO role/status field: the server always creates a CUSTOMER (anti mass-assignment).
 * Date of birth is only used to check >= 18 (OQ-025) and is not stored.
 */
public record RegisterCustomerRequest(
        @NotBlank @Pattern(regexp = "0[35789][0-9]{8}") String phone,
        @NotBlank @Pattern(regexp = "[0-9]{6}") String otpCode,
        @NotBlank @Size(max = 100) String fullName,
        @NotNull LocalDate dateOfBirth,
        @NotBlank @Size(min = 8, max = 128) String password,
        @Email @Size(max = 254) String email,
        @NotBlank String acceptedTermsVersion,
        @NotBlank String acceptedPrivacyVersion) {}
