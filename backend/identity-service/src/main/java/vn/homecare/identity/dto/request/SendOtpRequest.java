package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import vn.homecare.identity.entity.OtpPurpose;

/** API-SV04-001. {@code destination} is a Vietnamese mobile number (10 digits) or an email. */
public record SendOtpRequest(
        @NotBlank @Size(max = 254) String destination,
        @NotNull OtpPurpose purpose) {}
