package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** API-SV04-014. */
public record UnlockAccountRequest(
        @NotBlank @Size(max = 500) String reason) {}
