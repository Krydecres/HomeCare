package vn.homecare.identity.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.homecare.common.audit.AuditEventRecorder;
import vn.homecare.common.exception.BusinessException;
import vn.homecare.identity.client.KeycloakAdminClient;
import vn.homecare.identity.client.KeycloakRole;
import vn.homecare.identity.client.KeycloakUser;
import vn.homecare.identity.dto.request.GrantRoleRequest;
import vn.homecare.identity.entity.Account;
import vn.homecare.identity.entity.AccountRole;
import vn.homecare.identity.entity.AppRole;
import vn.homecare.identity.repository.AccountRepository;
import vn.homecare.identity.repository.AccountRoleRepository;
import vn.homecare.identity.service.RoleGrantService;

@Service
public class RoleGrantServiceImpl implements RoleGrantService {

    private final AccountRepository accountRepository;
    private final AccountRoleRepository accountRoleRepository;
    private final KeycloakAdminClient keycloak;
    private final AuditEventRecorder audit;
    private final Clock clock;

    public RoleGrantServiceImpl(
            AccountRepository accountRepository,
            AccountRoleRepository accountRoleRepository,
            KeycloakAdminClient keycloak,
            AuditEventRecorder audit,
            Clock clock) {
        this.accountRepository = accountRepository;
        this.accountRoleRepository = accountRoleRepository;
        this.keycloak = keycloak;
        this.audit = audit;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void grantByPartner(UUID accountId, GrantRoleRequest request) {
        if (!AppRole.GRANTED_BY_PARTNER.contains(request.role())) {
            throw new BusinessException(
                    HttpStatus.UNPROCESSABLE_CONTENT, "ROLE_NOT_GRANTABLE", "Role này không được cấp qua bệnh viện.");
        }
        grant(accountId, request.role(), request.partnerOrgId(), request.decidedBy());
        if (request.role() == AppRole.CAREGIVER) {
            accountRoleRepository
                    .findByAccountIdAndRoleAndRevokedAtIsNull(accountId, AppRole.CAREGIVER_PENDING)
                    .ifPresent(pending -> revoke(accountId, AppRole.CAREGIVER_PENDING, "Bệnh viện đã duyệt"));
        }
        setPartnerOrgAttribute(account(accountId), request.partnerOrgId());
    }

    @Override
    @Transactional
    public void grant(UUID accountId, AppRole role, UUID partnerOrgId, UUID grantedBy) {
        Account account = account(accountId);
        if (accountRoleRepository
                .findByAccountIdAndRoleAndRevokedAtIsNull(accountId, role)
                .isPresent()) {
            return;
        }
        accountRoleRepository.save(new AccountRole(accountId, role, partnerOrgId, grantedBy, Instant.now(clock)));
        keycloak.addRealmRoles(account.getKeycloakUserId(), List.of(realmRole(role)));
        audit.record("ROLE_GRANTED", "Account", accountId, role.name());
    }

    @Override
    @Transactional
    public void revoke(UUID accountId, AppRole role, String reason) {
        Account account = account(accountId);
        AccountRole active = accountRoleRepository
                .findByAccountIdAndRoleAndRevokedAtIsNull(accountId, role)
                .orElseThrow(() ->
                        new BusinessException(HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND", "Tài khoản không có role này."));
        active.revoke(Instant.now(clock), reason);
        keycloak.removeRealmRoles(account.getKeycloakUserId(), List.of(realmRole(role)));
        // US-01-009: permissions shrink immediately – every session must log in again.
        keycloak.logoutAllSessions(account.getKeycloakUserId());
        audit.record("ROLE_REVOKED", "Account", accountId, role.name() + ": " + reason);
    }

    private Account account(UUID accountId) {
        return accountRepository
                .findById(accountId)
                .orElseThrow(() ->
                        new BusinessException(HttpStatus.NOT_FOUND, "ACCOUNT_NOT_FOUND", "Không tìm thấy tài khoản."));
    }

    private KeycloakRole realmRole(AppRole role) {
        return keycloak.getRealmRole(role.name());
    }

    private void setPartnerOrgAttribute(Account account, UUID partnerOrgId) {
        KeycloakUser user = keycloak.getUser(account.getKeycloakUserId());
        Map<String, List<String>> attributes = new HashMap<>(user.attributes() == null ? Map.of() : user.attributes());
        attributes.put("partnerOrgId", List.of(partnerOrgId.toString()));
        keycloak.updateUser(account.getKeycloakUserId(), user.withAttributes(attributes));
    }
}
