package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import vn.homecare.identity.entity.AppRole;

/** API-SV04-025 (US-14-007): incident tool - sign out every account holding a role. */
public record SessionRevocationRequest(
        @NotNull AppRole role, @NotBlank @Size(max = 500) String reason) {}
