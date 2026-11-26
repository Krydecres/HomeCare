package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** API-SV04-013 (US-01-008): reason is mandatory and shown to the user. */
public record LockAccountRequest(@NotBlank @Size(max = 500) String reason, Boolean safetyIncident) {}
