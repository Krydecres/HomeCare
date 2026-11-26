package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import vn.homecare.identity.entity.ConsentType;

/** API-SV04-016 (US-14-001). */
public record GrantConsentRequest(
        @NotNull ConsentType consentType,
        @NotBlank @Size(max = 20) String policyVersion) {}
