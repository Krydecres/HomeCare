package vn.homecare.identity.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.client.HttpClientErrorException;
import vn.homecare.common.audit.AuditEventRecorder;
import vn.homecare.common.exception.BusinessException;
import vn.homecare.common.outbox.OutboxEventRecorder;
import vn.homecare.common.security.LookupHasher;
import vn.homecare.identity.client.KeycloakAdminClient;
import vn.homecare.identity.client.KeycloakUser;
import vn.homecare.identity.client.PartnerOrgClient;
import vn.homecare.identity.config.IdentityProperties;
import vn.homecare.identity.dto.request.LockAccountRequest;
import vn.homecare.identity.dto.request.RegisterCustomerRequest;
import vn.homecare.identity.dto.request.ResetPasswordRequest;
import vn.homecare.identity.entity.Account;
import vn.homecare.identity.entity.AccountRole;
import vn.homecare.identity.entity.AppRole;
import vn.homecare.identity.entity.OtpPurpose;
import vn.homecare.identity.mapper.AccountMapperImpl;
import vn.homecare.identity.repository.AccountRepository;
import vn.homecare.identity.repository.AccountRoleRepository;
import vn.homecare.identity.repository.LoginSessionRepository;
import vn.homecare.identity.repository.WebPushSubscriptionRepository;
import vn.homecare.identity.service.ConsentService;
import vn.homecare.identity.service.OtpService;
import vn.homecare.identity.service.RoleGrantService;

class AccountServiceImplTest {

    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-25T03:00:00Z"), ZoneOffset.UTC);

    private final AccountRepository accounts = mock(AccountRepository.class);
    private final AccountRoleRepository roles = mock(AccountRoleRepository.class);
    private final LoginSessionRepository sessions = mock(LoginSessionRepository.class);
    private final KeycloakAdminClient keycloak = mock(KeycloakAdminClient.class);
    private final OtpService otp = mock(OtpService.class);
    private final ConsentService consents = mock(ConsentService.class);
    private final RoleGrantService roleGrants = mock(RoleGrantService.class);
    private final OutboxEventRecorder outbox = mock(OutboxEventRecorder.class);
    private final AuditEventRecorder audit = mock(AuditEventRecorder.class);
    private final LookupHasher hasher = new LookupHasher("c2VjcmV0LWtleS1mb3ItdGVzdHMtb25seS0zMmJ5dGVz");
    private AccountServiceImpl service;

    @BeforeEach
    void setUp() {
        IdentityProperties properties =
                new IdentityProperties(Map.of(), null, Duration.ofDays(30), "http://kc", Duration.ofDays(3), null);
        service = new AccountServiceImpl(
                accounts,
                roles,
                sessions,
                mock(WebPushSubscriptionRepository.class),
                keycloak,
                mock(PartnerOrgClient.class),
                mock(CircuitBreakerFactory.class),
                otp,
                consents,
                roleGrants,
                hasher,
                outbox,
                audit,
                new AccountMapperImpl(),
                properties,
                CLOCK);
        when(accounts.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private static RegisterCustomerRequest registration(LocalDate dateOfBirth) {
        return new RegisterCustomerRequest(
                "0912345678", "123456", "Phạm Minh Tuấn", dateOfBirth, "matkhau123", null, "2026.11", "2026.11");
    }

    @Test
    @DisplayName("TC-US-01-001-3: đăng ký thành công → user Keycloak + account CUSTOMER + đồng ý + account.registered")
    void registersCustomer() {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("http://kc/admin/realms/homecare/users/kc-123"));
        when(keycloak.createUser(any())).thenReturn(new ResponseEntity<>(headers, HttpStatus.CREATED));

        var response = service.registerCustomer(registration(LocalDate.of(1990, 5, 1)));

        verify(otp).verify("0912345678", OtpPurpose.REGISTER, "123456");
        ArgumentCaptor<KeycloakUser> user = ArgumentCaptor.forClass(KeycloakUser.class);
        verify(keycloak).createUser(user.capture());
        assertThat(user.getValue().username()).isEqualTo("0912345678");
        assertThat(user.getValue().credentials()).hasSize(1);
        ArgumentCaptor<AccountRole> role = ArgumentCaptor.forClass(AccountRole.class);
        verify(roles).save(role.capture());
        assertThat(role.getValue().getRole()).isEqualTo(AppRole.CUSTOMER);
        verify(consents).recordAll(eq(response.id()), anyMap());
        verify(outbox).record(eq("Account"), eq(response.id()), eq("account.registered"), any());
        assertThat(response.phoneMasked()).isEqualTo("091*****78");
    }

    @Test
    @DisplayName("TC-US-01-001-4: dưới 18 tuổi → UNDERAGE, không tạo gì")
    void rejectsUnderage() {
        assertThatThrownBy(() -> service.registerCustomer(registration(LocalDate.of(2010, 1, 1))))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", "UNDERAGE");
        verify(keycloak, never()).createUser(any());
    }

    @Test
    @DisplayName("TC-US-01-001-5: SĐT đã có tài khoản → PHONE_ALREADY_REGISTERED")
    void rejectsDuplicatePhone() {
        when(accounts.existsByPhoneHash(hasher.hash("0912345678"))).thenReturn(true);
        assertThatThrownBy(() -> service.registerCustomer(registration(LocalDate.of(1990, 1, 1))))
                .hasFieldOrPropertyWithValue("errorCode", "PHONE_ALREADY_REGISTERED");
    }

    @Test
    @DisplayName("TC-US-01-003-1: mật khẩu trùng 3 mật khẩu gần nhất → PASSWORD_REUSED")
    void passwordHistory() {
        Account account =
                new Account(UUID.randomUUID(), "kc-1", "0912345678", hasher.hash("0912345678"), null, null, "A", null);
        when(accounts.findByPhoneHash(hasher.hash("0912345678"))).thenReturn(Optional.of(account));
        doThrow(HttpClientErrorException.create(
                        HttpStatus.BAD_REQUEST,
                        "Bad Request",
                        HttpHeaders.EMPTY,
                        "{\"error\":\"invalidPasswordHistoryMessage\"}".getBytes(StandardCharsets.UTF_8),
                        StandardCharsets.UTF_8))
                .when(keycloak)
                .resetPassword(eq("kc-1"), any());

        assertThatThrownBy(() -> service.resetPassword(new ResetPasswordRequest("0912345678", "123456", "matkhau123")))
                .hasFieldOrPropertyWithValue("errorCode", "PASSWORD_REUSED");
        verify(keycloak, never()).logoutAllSessions(anyString());
    }

    @Test
    @DisplayName("TC-US-01-003-2: SĐT không có tài khoản → cùng lỗi OTP_INVALID (không lộ thông tin)")
    void unknownDestinationLooksLikeWrongOtp() {
        assertThatThrownBy(() -> service.resetPassword(new ResetPasswordRequest("0987654321", "123456", "matkhau123")))
                .hasFieldOrPropertyWithValue("errorCode", "OTP_INVALID");
    }

    @Test
    @DisplayName("TC-US-01-008-2: không khóa được Admin cuối cùng → LAST_ADMIN")
    void keepsLastAdmin() {
        Jwt adminJwt = jwt("kc-admin");
        Account admin =
                new Account(UUID.randomUUID(), "kc-admin", null, null, "a@x.vn", hasher.hash("a@x.vn"), "A", null);
        Account other =
                new Account(UUID.randomUUID(), "kc-other", null, null, "b@x.vn", hasher.hash("b@x.vn"), "B", null);
        when(accounts.findByKeycloakUserId("kc-admin")).thenReturn(Optional.of(admin));
        when(accounts.findById(other.getId())).thenReturn(Optional.of(other));
        when(roles.findByAccountIdAndRevokedAtIsNull(other.getId()))
                .thenReturn(List.of(new AccountRole(other.getId(), AppRole.ADMIN, null, null, Instant.now(CLOCK))));
        when(accounts.countActiveAdmins()).thenReturn(1L);

        assertThatThrownBy(() -> service.lock(adminJwt, other.getId(), new LockAccountRequest("Vi phạm", false)))
                .hasFieldOrPropertyWithValue("errorCode", "LAST_ADMIN");
        verify(keycloak, never()).logoutAllSessions(anyString());
    }

    @Test
    @DisplayName("TC-US-01-008-3: khóa tài khoản → tắt user Keycloak, thu hồi phiên, phát account.locked")
    void locksAccount() {
        Jwt adminJwt = jwt("kc-admin");
        Account admin =
                new Account(UUID.randomUUID(), "kc-admin", null, null, "a@x.vn", hasher.hash("a@x.vn"), "A", null);
        Account target =
                new Account(UUID.randomUUID(), "kc-t", "0912345678", hasher.hash("0912345678"), null, null, "T", null);
        when(accounts.findByKeycloakUserId("kc-admin")).thenReturn(Optional.of(admin));
        when(accounts.findById(target.getId())).thenReturn(Optional.of(target));
        when(keycloak.getUser("kc-t"))
                .thenReturn(
                        new KeycloakUser("kc-t", "0912345678", null, "T", null, true, false, null, null, null, null));

        var response = service.lock(adminJwt, target.getId(), new LockAccountRequest("Gian lận khuyến mãi", false));

        ArgumentCaptor<KeycloakUser> update = ArgumentCaptor.forClass(KeycloakUser.class);
        verify(keycloak).updateUser(eq("kc-t"), update.capture());
        assertThat(update.getValue().enabled()).isFalse();
        assertThat(update.getValue().username()).isEqualTo("0912345678");
        verify(keycloak).logoutAllSessions("kc-t");
        verify(outbox).record(eq("Account"), eq(target.getId()), eq("account.locked"), any());
        assertThat(response.status()).isEqualTo("LOCKED");
    }

    @Test
    void cannotLockSelf() {
        Account admin =
                new Account(UUID.randomUUID(), "kc-admin", null, null, "a@x.vn", hasher.hash("a@x.vn"), "A", null);
        when(accounts.findByKeycloakUserId("kc-admin")).thenReturn(Optional.of(admin));
        when(accounts.findById(admin.getId())).thenReturn(Optional.of(admin));
        assertThatThrownBy(() -> service.lock(jwt("kc-admin"), admin.getId(), new LockAccountRequest("x", false)))
                .hasFieldOrPropertyWithValue("errorCode", "CANNOT_LOCK_SELF");
    }

    @Test
    void parsesUserAgent() {
        String chromeOnAndroid = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36";
        assertThat(AccountServiceImpl.browserOf(chromeOnAndroid)).isEqualTo("Chrome");
        assertThat(AccountServiceImpl.osOf(chromeOnAndroid)).isEqualTo("Android");
        assertThat(AccountServiceImpl.browserOf(null)).isEqualTo("Không rõ");
    }

    private static Jwt jwt(String subject) {
        return Jwt.withTokenValue("t").header("alg", "RS256").subject(subject).build();
    }
}
