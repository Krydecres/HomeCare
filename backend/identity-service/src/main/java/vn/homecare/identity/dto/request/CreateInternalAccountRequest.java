package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.Set;
import vn.homecare.identity.entity.AppRole;

/** API-SV04-011 (US-01-007): only DISPATCHER, ADMIN, ACCOUNTANT allowed (else ROLE_NOT_INTERNAL). */
public record CreateInternalAccountRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(max = 100) String fullName,
        @NotEmpty Set<AppRole> roles) {}
