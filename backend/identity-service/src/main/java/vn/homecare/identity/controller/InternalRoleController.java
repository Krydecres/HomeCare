package vn.homecare.identity.controller;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.homecare.identity.dto.request.GrantRoleRequest;
import vn.homecare.identity.entity.AppRole;
import vn.homecare.identity.service.RoleGrantService;

/**
 * API-SV04-020 / 021 – internal, never routed by the gateway. Only the service account of caregiver-service may call
 * it (OQ-037: CAREGIVER is granted only after a partner hospital approves).
 */
@RestController
@RequestMapping("/internal/v1/accounts/{id}/roles")
@PreAuthorize(InternalRoleController.CAREGIVER_SERVICE_ONLY)
public class InternalRoleController {

    static final String CAREGIVER_SERVICE_ONLY =
            "hasRole('SYSTEM') and authentication.token.getClaimAsString('azp') == 'caregiver-service'";

    private final RoleGrantService roleGrantService;

    public InternalRoleController(RoleGrantService roleGrantService) {
        this.roleGrantService = roleGrantService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(CAREGIVER_SERVICE_ONLY)
    public void grantRole(@PathVariable UUID id, @Valid @RequestBody GrantRoleRequest request) {
        roleGrantService.grantByPartner(id, request);
    }

    @DeleteMapping("/{role}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(CAREGIVER_SERVICE_ONLY)
    public void revokeRole(
            @PathVariable UUID id,
            @PathVariable AppRole role,
            @RequestParam(defaultValue = "Bệnh viện gỡ vai trò") String reason) {
        roleGrantService.revoke(id, role, reason);
    }
}
