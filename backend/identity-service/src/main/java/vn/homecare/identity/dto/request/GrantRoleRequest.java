package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import vn.homecare.identity.entity.AppRole;

/** API-SV04-020 (internal, caregiver-service only): CAREGIVER or PARTNER_ORG after a partner hospital approves. */
public record GrantRoleRequest(
        @NotNull AppRole role, @NotNull UUID partnerOrgId, UUID decidedBy) {}
