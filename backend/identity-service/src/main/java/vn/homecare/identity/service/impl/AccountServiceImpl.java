package vn.homecare.identity.service.impl;

import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import vn.homecare.common.audit.AuditEventRecorder;
import vn.homecare.common.exception.BusinessException;
import vn.homecare.common.outbox.OutboxEventRecorder;
import vn.homecare.common.outbox.UuidV7;
import vn.homecare.common.security.KeycloakRoleConverter;
import vn.homecare.common.security.LookupHasher;
import vn.homecare.identity.client.KeycloakAdminClient;
import vn.homecare.identity.client.KeycloakCredential;
import vn.homecare.identity.client.KeycloakSession;
import vn.homecare.identity.client.KeycloakUser;
import vn.homecare.identity.client.PartnerOrgClient;
import vn.homecare.identity.client.PartnerOrgView;
import vn.homecare.identity.config.IdentityProperties;
import vn.homecare.identity.dto.request.AccountSearchRequest;
import vn.homecare.identity.dto.request.CreateInternalAccountRequest;
import vn.homecare.identity.dto.request.DeleteAccountRequest;
import vn.homecare.identity.dto.request.LockAccountRequest;
import vn.homecare.identity.dto.request.RegisterCaregiverRequest;
import vn.homecare.identity.dto.request.RegisterCustomerRequest;
import vn.homecare.identity.dto.request.ResetPasswordRequest;
import vn.homecare.identity.dto.request.SessionRevocationRequest;
import vn.homecare.identity.dto.request.UnlockAccountRequest;
import vn.homecare.identity.dto.response.AccountDeletionResponse;
import vn.homecare.identity.dto.response.AccountResponse;
import vn.homecare.identity.dto.response.AccountSummaryResponse;
import vn.homecare.identity.dto.response.LoginSessionResponse;
import vn.homecare.identity.entity.Account;
import vn.homecare.identity.entity.AccountRole;
import vn.homecare.identity.entity.AccountStatus;
import vn.homecare.identity.entity.AppRole;
import vn.homecare.identity.entity.ConsentType;
import vn.homecare.identity.entity.LoginSession;
import vn.homecare.identity.entity.OtpPurpose;
import vn.homecare.identity.mapper.AccountMapper;
import vn.homecare.identity.repository.AccountRepository;
import vn.homecare.identity.repository.AccountRoleRepository;
import vn.homecare.identity.repository.LoginSessionRepository;
import vn.homecare.identity.repository.WebPushSubscriptionRepository;
import vn.homecare.identity.service.AccountService;
import vn.homecare.identity.service.ConsentService;
import vn.homecare.identity.service.OtpService;
import vn.homecare.identity.service.RoleGrantService;

@Service
public class AccountServiceImpl implements AccountService {

    static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    static final int MIN_AGE = 18; // OQ-025
    private static final String AGGREGATE = "Account";
    private static final Logger log = LoggerFactory.getLogger(AccountServiceImpl.class);

    private final AccountRepository accountRepository;
    private final AccountRoleRepository accountRoleRepository;
    private final LoginSessionRepository loginSessionRepository;
    private final WebPushSubscriptionRepository webPushSubscriptionRepository;
    private final KeycloakAdminClient keycloak;
    private final PartnerOrgClient partnerOrgClient;
    private final CircuitBreakerFactory<?, ?> circuitBreakers;
    private final OtpService otpService;
    private final ConsentService consentService;
    private final RoleGrantService roleGrantService;
    private final LookupHasher hasher;
    private final OutboxEventRecorder outbox;
    private final AuditEventRecorder audit;
    private final AccountMapper mapper;
    private final IdentityProperties properties;
    private final Clock clock;

    public AccountServiceImpl(
            AccountRepository accountRepository,
            AccountRoleRepository accountRoleRepository,
            LoginSessionRepository loginSessionRepository,
            WebPushSubscriptionRepository webPushSubscriptionRepository,
            KeycloakAdminClient keycloak,
            PartnerOrgClient partnerOrgClient,
            CircuitBreakerFactory<?, ?> circuitBreakers,
            OtpService otpService,
            @Lazy ConsentService consentService,
            RoleGrantService roleGrantService,
            LookupHasher hasher,
            OutboxEventRecorder outbox,
            AuditEventRecorder audit,
            AccountMapper mapper,
            IdentityProperties properties,
            Clock clock) {
        this.accountRepository = accountRepository;
        this.accountRoleRepository = accountRoleRepository;
        this.loginSessionRepository = loginSessionRepository;
        this.webPushSubscriptionRepository = webPushSubscriptionRepository;
        this.keycloak = keycloak;
        this.partnerOrgClient = partnerOrgClient;
        this.circuitBreakers = circuitBreakers;
        this.otpService = otpService;
        this.consentService = consentService;
        this.roleGrantService = roleGrantService;
        this.hasher = hasher;
        this.outbox = outbox;
        this.audit = audit;
        this.mapper = mapper;
        this.properties = properties;
        this.clock = clock;
    }

    // ------------------------------------------------------------------ US-01-001 register customer

    @Override
    @Transactional
    public AccountResponse registerCustomer(RegisterCustomerRequest request) {
        requireAdult(request.dateOfBirth());
        String phone = OtpService.normalize(request.phone());
        String phoneHash = hasher.hash(phone);
        String email =
                request.email() == null || request.email().isBlank() ? null : OtpService.normalize(request.email());
        String emailHash = hasher.hash(email);
        if (accountRepository.existsByPhoneHash(phoneHash)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_REGISTERED",
                    "Số điện thoại đã có tài khoản. Vui lòng đăng nhập.");
        }
        if (emailHash != null && accountRepository.existsByEmailHash(emailHash)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT, "EMAIL_ALREADY_USED", "Email đã được dùng cho tài khoản khác.");
        }
        Map<ConsentType, String> consents = new EnumMap<>(ConsentType.class);
        consents.put(ConsentType.TERMS, request.acceptedTermsVersion());
        consents.put(ConsentType.PRIVACY, request.acceptedPrivacyVersion());
        otpService.verify(phone, OtpPurpose.REGISTER, request.otpCode());

        UUID accountId = UuidV7.next(Instant.now(clock));
        String keycloakId = createKeycloakUser(new KeycloakUser(
                null,
                phone,
                email,
                request.fullName().trim(),
                null,
                true,
                false,
                Map.of("accountId", List.of(accountId.toString())),
                List.of(KeycloakCredential.password(request.password())),
                null,
                null));
        Account account = accountRepository.save(new Account(
                accountId,
                keycloakId,
                phone,
                phoneHash,
                email,
                emailHash,
                request.fullName().trim(),
                null));
        accountRoleRepository.save(new AccountRole(accountId, AppRole.CUSTOMER, null, accountId, Instant.now(clock)));
        consentService.recordAll(accountId, consents);
        outbox.record(
                AGGREGATE,
                accountId,
                "account.registered",
                Map.of("accountId", accountId, "roles", List.of("CUSTOMER")));
        audit.record("ACCOUNT_REGISTERED", AGGREGATE, accountId, null);
        return toResponse(account, null);
    }

    // ------------------------------------------------------------------ US-01-003 reset password

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String destination = OtpService.normalize(request.destination());
        otpService.verify(destination, OtpPurpose.RESET_PASSWORD, request.otpCode());
        String hash = hasher.hash(destination);
        Account account = (destination.contains("@")
                        ? accountRepository.findByEmailHash(hash)
                        : accountRepository.findByPhoneHash(hash))
                .filter(a -> a.getStatus() != AccountStatus.DELETED)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.BAD_REQUEST, "OTP_INVALID", "Mã OTP không đúng hoặc đã hết hạn."));
        try {
            keycloak.resetPassword(account.getKeycloakUserId(), KeycloakCredential.password(request.newPassword()));
        } catch (HttpClientErrorException e) {
            throw passwordError(e);
        }
        keycloak.logoutAllSessions(account.getKeycloakUserId());
        revokeLoginSessions(account.getId());
        outbox.record(AGGREGATE, account.getId(), "account.password-reset", Map.of("accountId", account.getId()));
        audit.record("PASSWORD_RESET", AGGREGATE, account.getId(), null);
    }

    // ------------------------------------------------------------------ me

    @Override
    @Transactional
    public AccountResponse getMine(Jwt jwt) {
        return toResponse(resolveCurrent(jwt), null);
    }

    // ------------------------------------------------------------------ US-01-004 register caregiver

    @Override
    @Transactional
    public AccountResponse registerCaregiver(Jwt jwt, RegisterCaregiverRequest request) {
        Account account = resolveCurrent(jwt);
        requireAdult(request.dateOfBirth());
        Set<AppRole> roles = activeRoles(account.getId());
        if (roles.contains(AppRole.CAREGIVER) || roles.contains(AppRole.CAREGIVER_PENDING)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT, "ALREADY_CAREGIVER", "Tài khoản đã đăng ký làm nhân viên.");
        }
        PartnerOrgView partnerOrg = circuitBreakers
                .create("caregiver-service")
                .run(() -> partnerOrgClient.getPartnerOrg(request.partnerOrgId()), error -> {
                    if (error instanceof HttpClientErrorException.NotFound) {
                        return new PartnerOrgView(request.partnerOrgId(), "NOT_FOUND");
                    }
                    log.warn("caregiver-service unavailable: {}", error.getMessage());
                    throw new BusinessException(
                            HttpStatus.SERVICE_UNAVAILABLE,
                            "PARTNER_ORG_CHECK_UNAVAILABLE",
                            "Chưa kiểm tra được bệnh viện, vui lòng thử lại sau.");
                });
        if (!partnerOrg.isActive()) {
            throw new BusinessException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "PARTNER_ORG_NOT_ACTIVE",
                    "Bệnh viện/cơ sở đối tác này chưa hoạt động trên nền tảng.");
        }
        Map<ConsentType, String> consents = new EnumMap<>(ConsentType.class);
        consents.put(ConsentType.CAREGIVER_CODE, request.acceptedCaregiverCodeVersion());
        consents.put(ConsentType.PARTNER_SHARING, request.acceptedPartnerSharingVersion());
        consentService.recordAll(account.getId(), consents);
        roleGrantService.grant(account.getId(), AppRole.CAREGIVER_PENDING, request.partnerOrgId(), account.getId());
        setKeycloakAttribute(account, "staffType", request.staffType().name());
        Map<String, Object> payload = new HashMap<>();
        payload.put("accountId", account.getId());
        payload.put("staffType", request.staffType().name());
        payload.put("partnerOrgId", request.partnerOrgId());
        payload.put("workplaceNote", request.workplaceNote());
        outbox.record(AGGREGATE, account.getId(), "account.caregiver-registered", payload);
        audit.record(
                "CAREGIVER_REGISTERED",
                AGGREGATE,
                account.getId(),
                request.staffType().name());
        return toResponse(account, null);
    }

    // ------------------------------------------------------------------ US-01-006 sessions

    @Override
    @Transactional
    public List<LoginSessionResponse> listSessions(Jwt jwt) {
        Account account = resolveCurrent(jwt);
        String currentSid = jwt.getClaimAsString("sid");
        Map<String, LoginSession> known = loginSessionRepository.findByAccountId(account.getId()).stream()
                .collect(Collectors.toMap(LoginSession::getSessionRefHash, s -> s, (a, b) -> a));
        List<LoginSessionResponse> result = new ArrayList<>();
        for (KeycloakSession session : keycloak.getSessions(account.getKeycloakUserId())) {
            LoginSession info = known.get(hasher.hash(session.id()));
            String userAgent = info == null ? null : info.getUserAgent();
            result.add(new LoginSessionResponse(
                    session.id(),
                    browserOf(userAgent),
                    osOf(userAgent),
                    session.start() == null ? null : Instant.ofEpochMilli(session.start()),
                    session.lastAccess() == null ? null : Instant.ofEpochMilli(session.lastAccess()),
                    session.id().equals(currentSid)));
        }
        return result;
    }

    @Override
    @Transactional
    public void registerCurrentSession(Jwt jwt, String userAgent, String clientIp) {
        String sid = jwt.getClaimAsString("sid");
        if (sid == null) {
            return;
        }
        Account account = resolveCurrent(jwt);
        String refHash = hasher.hash(sid);
        Instant now = Instant.now(clock);
        Optional<LoginSession> existing = loginSessionRepository.findBySessionRefHash(refHash);
        if (existing.isPresent()) {
            existing.get().touch(now);
            return;
        }
        boolean hadOtherSessions = loginSessionRepository.findByAccountId(account.getId()).stream()
                .anyMatch(s -> s.getRevokedAt() == null);
        loginSessionRepository.save(new LoginSession(
                account.getId(), refHash, userAgent, clientIp == null ? null : hasher.hash(clientIp), now));
        if (hadOtherSessions) {
            // US-01-006: tell the other sessions that a new browser logged in (notification-service).
            outbox.record(
                    AGGREGATE,
                    account.getId(),
                    "account.new-login",
                    Map.of("accountId", account.getId(), "browser", browserOf(userAgent), "os", osOf(userAgent)));
        }
    }

    @Override
    @Transactional
    public void revokeSession(Jwt jwt, String sessionId) {
        Account account = resolveCurrent(jwt);
        if ("all".equals(sessionId)) {
            keycloak.logoutAllSessions(account.getKeycloakUserId());
            revokeLoginSessions(account.getId());
            audit.record("SESSIONS_REVOKED", AGGREGATE, account.getId(), "all");
            return;
        }
        boolean mine =
                keycloak.getSessions(account.getKeycloakUserId()).stream().anyMatch(s -> s.id().equals(sessionId));
        if (!mine) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND", "Không tìm thấy phiên đăng nhập.");
        }
        keycloak.deleteSession(sessionId);
        loginSessionRepository
                .findBySessionRefHash(hasher.hash(sessionId))
                .ifPresent(s -> s.revoke(Instant.now(clock)));
        audit.record("SESSION_REVOKED", AGGREGATE, account.getId(), null);
    }

    // ------------------------------------------------------------------ US-14-003 deletion

    @Override
    @Transactional
    public AccountDeletionResponse requestDeletion(Jwt jwt, DeleteAccountRequest request) {
        Account account = resolveCurrent(jwt);
        if (activeRoles(account.getId()).stream().anyMatch(AppRole.INTERNAL::contains)) {
            throw new BusinessException(
                    HttpStatus.FORBIDDEN, "FORBIDDEN", "Tài khoản nội bộ được Admin xử lý, không tự xóa được.");
        }
        if (account.getStatus() != AccountStatus.PENDING_DELETION) {
            String destination = account.getPhone() != null ? account.getPhone() : account.getEmail();
            otpService.verify(destination, OtpPurpose.REAUTH, request.otpCode());
            account.requestDeletion(Instant.now(clock));
            Instant scheduledAt = account.getDeletionRequestedAt().plus(properties.deletionGracePeriod());
            // Other services can object (open booking, dispute, wallet balance) – OQ-044.
            outbox.record(
                    AGGREGATE,
                    account.getId(),
                    "account.deletion-requested",
                    Map.of("accountId", account.getId(), "scheduledAt", scheduledAt.toString()));
            audit.record("ACCOUNT_DELETION_REQUESTED", AGGREGATE, account.getId(), null);
        }
        return new AccountDeletionResponse(
                account.getStatus().name(), account.getDeletionRequestedAt().plus(properties.deletionGracePeriod()));
    }

    @Override
    @Transactional
    public AccountResponse cancelDeletion(Jwt jwt) {
        Account account = resolveCurrent(jwt);
        if (account.getStatus() == AccountStatus.PENDING_DELETION) {
            account.cancelDeletion();
            audit.record("ACCOUNT_DELETION_CANCELLED", AGGREGATE, account.getId(), null);
        }
        return toResponse(account, null);
    }

    @Override
    @Transactional
    public int anonymizeDueAccounts() {
        Instant now = Instant.now(clock);
        List<Account> due = accountRepository.findByStatusAndDeletionRequestedAtBefore(
                AccountStatus.PENDING_DELETION, now.minus(properties.deletionGracePeriod()));
        for (Account account : due) {
            try {
                keycloak.deleteUser(account.getKeycloakUserId());
            } catch (HttpClientErrorException.NotFound ignored) {
                // already gone in Keycloak
            }
            accountRoleRepository
                    .findByAccountIdAndRevokedAtIsNull(account.getId())
                    .forEach(r -> r.revoke(now, "Xóa tài khoản"));
            loginSessionRepository.deleteAll(loginSessionRepository.findByAccountId(account.getId()));
            webPushSubscriptionRepository.deleteAll(webPushSubscriptionRepository.findByAccountId(account.getId()));
            account.anonymize(now);
            outbox.record(AGGREGATE, account.getId(), "account.deleted", Map.of("accountId", account.getId()));
            audit.record("ACCOUNT_ANONYMIZED", AGGREGATE, account.getId(), null);
        }
        return due.size();
    }

    // ------------------------------------------------------------------ admin (US-13-003, US-01-007, US-01-008)

    @Override
    @Transactional(readOnly = true)
    public Page<AccountSummaryResponse> search(AccountSearchRequest request) {
        PageRequest pageable = PageRequest.of(
                request.pageOrDefault(), request.sizeOrDefault(), Sort.by(Sort.Direction.DESC, "createdAt"));
        String q = request.q() == null ? "" : request.q().trim();
        Page<Account> page;
        if (q.isEmpty()) {
            page = accountRepository.search(request.status(), request.role(), pageable);
        } else if (OtpServiceImpl.VN_MOBILE.matcher(OtpService.normalize(q)).matches() || q.contains("@")) {
            List<Account> found = (q.contains("@")
                            ? accountRepository.findByEmailHash(hasher.hash(OtpService.normalize(q)))
                            : accountRepository.findByPhoneHash(hasher.hash(OtpService.normalize(q))))
                    .stream().toList();
            page = new PageImpl<>(found, pageable, found.size());
        } else {
            List<String> ids = keycloak.findUsers(null, null, q, 0, 200).stream()
                    .map(KeycloakUser::id)
                    .toList();
            page = ids.isEmpty() ? Page.empty(pageable) : accountRepository.findByKeycloakUserIdIn(ids, pageable);
        }
        Map<UUID, List<String>> roles =
                rolesOf(page.getContent().stream().map(Account::getId).toList());
        List<AccountSummaryResponse> rows = page.getContent().stream()
                .filter(a -> a.getStatus() != AccountStatus.DELETED)
                .filter(a -> request.status() == null || a.getStatus() == request.status())
                .filter(a -> request.role() == null
                        || roles.getOrDefault(a.getId(), List.of())
                                .contains(request.role().name()))
                .map(a -> mapper.toSummary(a, roles.getOrDefault(a.getId(), List.of())))
                .toList();
        return new PageImpl<>(rows, pageable, q.isEmpty() ? page.getTotalElements() : rows.size());
    }

    @Override
    @Transactional
    public AccountResponse createInternal(Jwt jwt, CreateInternalAccountRequest request) {
        Account admin = resolveCurrent(jwt);
        if (!AppRole.INTERNAL.containsAll(request.roles())) {
            throw new BusinessException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "ROLE_NOT_INTERNAL",
                    "Chỉ được tạo tài khoản Điều phối, Kế toán, Admin.");
        }
        String email = OtpService.normalize(request.email());
        String emailHash = hasher.hash(email);
        if (accountRepository.existsByEmailHash(emailHash)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT, "EMAIL_ALREADY_USED", "Email đã được dùng cho tài khoản khác.");
        }
        UUID accountId = UuidV7.next(Instant.now(clock));
        String keycloakId = createKeycloakUser(new KeycloakUser(
                null,
                email,
                email,
                request.fullName().trim(),
                null,
                true,
                true,
                Map.of("accountId", List.of(accountId.toString())),
                null,
                List.of("UPDATE_PASSWORD", "CONFIGURE_TOTP"),
                null));
        Account account = accountRepository.save(new Account(
                accountId,
                keycloakId,
                null,
                null,
                email,
                emailHash,
                request.fullName().trim(),
                admin.getId()));
        // Keycloak gives every new user the default role (CUSTOMER); staff accounts must not have it.
        try {
            keycloak.removeRealmRoles(keycloakId, List.of(keycloak.getRealmRole("default-roles-homecare")));
        } catch (HttpClientErrorException e) {
            log.warn("Could not remove default role from internal account: {}", e.getStatusCode());
        }
        for (AppRole role : request.roles()) {
            roleGrantService.grant(accountId, role, null, admin.getId());
        }
        boolean invited = sendInvite(keycloakId);
        audit.record(
                "INTERNAL_ACCOUNT_CREATED",
                AGGREGATE,
                accountId,
                request.roles().stream().map(Enum::name).sorted().collect(Collectors.joining(",")));
        return toResponse(account, invited);
    }

    @Override
    @Transactional
    public AccountResponse lock(Jwt jwt, UUID accountId, LockAccountRequest request) {
        Account admin = resolveCurrent(jwt);
        Account target = find(accountId);
        if (target.getId().equals(admin.getId())) {
            throw new BusinessException(
                    HttpStatus.CONFLICT, "CANNOT_LOCK_SELF", "Không thể tự khóa tài khoản của mình.");
        }
        if (activeRoles(target.getId()).contains(AppRole.ADMIN) && accountRepository.countActiveAdmins() <= 1) {
            throw new BusinessException(HttpStatus.CONFLICT, "LAST_ADMIN", "Phải luôn còn ít nhất 1 Admin hoạt động.");
        }
        // ACCOUNT_HAS_ACTIVE_SHIFT needs booking-service (OQ-044); dispatch replaces future shifts on account.locked.
        KeycloakUser user = keycloak.getUser(target.getKeycloakUserId());
        keycloak.updateUser(target.getKeycloakUserId(), user.withEnabled(false));
        keycloak.logoutAllSessions(target.getKeycloakUserId());
        revokeLoginSessions(target.getId());
        target.lock(request.reason().trim(), admin.getId());
        outbox.record(
                AGGREGATE,
                target.getId(),
                "account.locked",
                Map.of("accountId", target.getId(), "safetyIncident", request.safetyIncident()));
        audit.record(
                "ACCOUNT_LOCKED", AGGREGATE, target.getId(), request.reason().trim());
        return toResponse(target, null);
    }

    @Override
    @Transactional
    public AccountResponse unlock(Jwt jwt, UUID accountId, UnlockAccountRequest request) {
        Account admin = resolveCurrent(jwt);
        Account target = find(accountId);
        if (target.getStatus() == AccountStatus.LOCKED) {
            KeycloakUser user = keycloak.getUser(target.getKeycloakUserId());
            keycloak.updateUser(target.getKeycloakUserId(), user.withEnabled(true));
            target.unlock(admin.getId());
            audit.record(
                    "ACCOUNT_UNLOCKED",
                    AGGREGATE,
                    target.getId(),
                    request.reason().trim());
        }
        return toResponse(target, null);
    }

    @Override
    @Transactional
    public int revokeSessionsByRole(Jwt jwt, SessionRevocationRequest request) {
        Account admin = resolveCurrent(jwt);
        List<UUID> accountIds = accountRoleRepository.findByRoleAndRevokedAtIsNull(request.role()).stream()
                .map(AccountRole::getAccountId)
                .distinct()
                .toList();
        int count = 0;
        for (Account account : accountRepository.findAllById(accountIds)) {
            if (account.getId().equals(admin.getId())) {
                continue;
            }
            keycloak.logoutAllSessions(account.getKeycloakUserId());
            revokeLoginSessions(account.getId());
            count++;
        }
        audit.record("SESSIONS_REVOKED_BY_ROLE", "Role", admin.getId(), request.role() + ": " + request.reason());
        return count;
    }

    // ------------------------------------------------------------------ current account

    @Override
    @Transactional
    public Account resolveCurrent(Jwt jwt) {
        return accountRepository.findByKeycloakUserId(jwt.getSubject()).orElseGet(() -> provision(jwt));
    }

    /** First request of a user created directly in Keycloak (dev users, bootstrap admin): copy what the token says. */
    private Account provision(Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        String phone =
                username != null && OtpServiceImpl.VN_MOBILE.matcher(username).matches() ? username : null;
        String email = jwt.getClaimAsString("email");
        UUID accountId = UuidV7.next(Instant.now(clock));
        Account account = accountRepository.save(new Account(
                accountId,
                jwt.getSubject(),
                phone,
                hasher.hash(phone),
                email,
                hasher.hash(email),
                jwt.getClaimAsString("name"),
                null));
        for (String role : KeycloakRoleConverter.extractRoles(jwt.getClaims())) {
            parseRole(role)
                    .ifPresent(r -> accountRoleRepository.save(new AccountRole(
                            accountId, r, parseUuid(jwt.getClaimAsString("partnerOrgId")), null, Instant.now(clock))));
        }
        setKeycloakAttribute(account, "accountId", accountId.toString());
        return account;
    }

    // ------------------------------------------------------------------ helpers

    private AccountResponse toResponse(Account account, Boolean inviteEmailSent) {
        List<AccountRole> roles = accountRoleRepository.findByAccountIdAndRevokedAtIsNull(account.getId());
        UUID partnerOrgId = roles.stream()
                .map(AccountRole::getPartnerOrgId)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
        Instant scheduled = account.getDeletionRequestedAt() == null
                ? null
                : account.getDeletionRequestedAt().plus(properties.deletionGracePeriod());
        return mapper.toResponse(
                account,
                roles.stream().map(r -> r.getRole().name()).sorted().toList(),
                partnerOrgId,
                scheduled,
                inviteEmailSent);
    }

    private Set<AppRole> activeRoles(UUID accountId) {
        return accountRoleRepository.findByAccountIdAndRevokedAtIsNull(accountId).stream()
                .map(AccountRole::getRole)
                .collect(Collectors.toSet());
    }

    private Map<UUID, List<String>> rolesOf(List<UUID> accountIds) {
        if (accountIds.isEmpty()) {
            return Map.of();
        }
        return accountRoleRepository.findByAccountIdInAndRevokedAtIsNull(accountIds).stream()
                .collect(Collectors.groupingBy(
                        AccountRole::getAccountId,
                        Collectors.mapping(r -> r.getRole().name(), Collectors.toList())));
    }

    private Account find(UUID accountId) {
        return accountRepository
                .findById(accountId)
                .filter(a -> a.getStatus() != AccountStatus.DELETED)
                .orElseThrow(() ->
                        new BusinessException(HttpStatus.NOT_FOUND, "ACCOUNT_NOT_FOUND", "Không tìm thấy tài khoản."));
    }

    private void requireAdult(LocalDate dateOfBirth) {
        if (Period.between(dateOfBirth, LocalDate.now(clock.withZone(VIETNAM))).getYears() < MIN_AGE) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_CONTENT, "UNDERAGE", "Bạn cần đủ 18 tuổi.");
        }
    }

    /** Creates the Keycloak user and deletes it again if our transaction rolls back. */
    private String createKeycloakUser(KeycloakUser user) {
        URI location;
        try {
            location = keycloak.createUser(user).getHeaders().getLocation();
        } catch (HttpClientErrorException.Conflict e) {
            throw user.username().contains("@")
                    ? new BusinessException(HttpStatus.CONFLICT, "EMAIL_ALREADY_USED", "Email đã được dùng.")
                    : new BusinessException(
                            HttpStatus.CONFLICT, "PHONE_ALREADY_REGISTERED", "Số điện thoại đã có tài khoản.");
        } catch (HttpClientErrorException e) {
            throw passwordError(e);
        }
        String path = Objects.requireNonNull(location, "Keycloak did not return the user location")
                .getPath();
        String keycloakId = path.substring(path.lastIndexOf('/') + 1);
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            return keycloakId;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK) {
                    try {
                        keycloak.deleteUser(keycloakId);
                    } catch (RestClientException e) {
                        log.error("Orphan Keycloak user {} left after rollback", keycloakId);
                    }
                }
            }
        });
        return keycloakId;
    }

    private static BusinessException passwordError(HttpClientErrorException e) {
        String body = e.getResponseBodyAsString();
        if (body.contains("invalidPasswordHistory")) {
            return new BusinessException(
                    HttpStatus.UNPROCESSABLE_CONTENT, "PASSWORD_REUSED", "Không dùng lại 3 mật khẩu gần nhất.");
        }
        return new BusinessException(
                HttpStatus.UNPROCESSABLE_CONTENT,
                "PASSWORD_WEAK",
                "Mật khẩu cần ít nhất 8 ký tự, có cả chữ và số, không chứa SĐT/email.");
    }

    private boolean sendInvite(String keycloakId) {
        try {
            keycloak.executeActionsEmail(
                    keycloakId,
                    (int) properties.inviteLinkLifespan().toSeconds(),
                    List.of("UPDATE_PASSWORD", "CONFIGURE_TOTP"));
            return true;
        } catch (RestClientException e) {
            log.warn("Invite email not sent (check Keycloak SMTP): {}", e.getMessage());
            return false;
        }
    }

    private void setKeycloakAttribute(Account account, String name, String value) {
        try {
            KeycloakUser user = keycloak.getUser(account.getKeycloakUserId());
            Map<String, List<String>> attributes =
                    new HashMap<>(user.attributes() == null ? Map.of() : user.attributes());
            attributes.put(name, List.of(value));
            keycloak.updateUser(account.getKeycloakUserId(), user.withAttributes(attributes));
        } catch (RestClientException e) {
            log.warn("Could not set Keycloak attribute {}: {}", name, e.getMessage());
        }
    }

    private void revokeLoginSessions(UUID accountId) {
        Instant now = Instant.now(clock);
        loginSessionRepository.findByAccountId(accountId).stream()
                .filter(s -> s.getRevokedAt() == null)
                .forEach(s -> s.revoke(now));
    }

    private static Optional<AppRole> parseRole(String role) {
        try {
            return Optional.of(AppRole.valueOf(role));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private static UUID parseUuid(String value) {
        try {
            return value == null ? null : UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    static String browserOf(String userAgent) {
        if (userAgent == null) {
            return "Không rõ";
        }
        if (userAgent.contains("Edg/")) {
            return "Edge";
        }
        if (userAgent.contains("OPR/") || userAgent.contains("Opera")) {
            return "Opera";
        }
        if (userAgent.contains("Chrome/")) {
            return "Chrome";
        }
        if (userAgent.contains("Firefox/")) {
            return "Firefox";
        }
        if (userAgent.contains("Safari/")) {
            return "Safari";
        }
        return "Trình duyệt khác";
    }

    static String osOf(String userAgent) {
        if (userAgent == null) {
            return "Không rõ";
        }
        if (userAgent.contains("Android")) {
            return "Android";
        }
        if (userAgent.contains("iPhone") || userAgent.contains("iPad")) {
            return "iOS";
        }
        if (userAgent.contains("Windows")) {
            return "Windows";
        }
        if (userAgent.contains("Mac OS")) {
            return "macOS";
        }
        if (userAgent.contains("Linux")) {
            return "Linux";
        }
        return "Khác";
    }
}
