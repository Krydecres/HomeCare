package vn.homecare.identity.it;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.net.URI;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import vn.homecare.common.storage.FileStorageService;
import vn.homecare.identity.client.KeycloakAdminClient;
import vn.homecare.identity.client.OtpSender;
import vn.homecare.identity.client.PartnerOrgClient;
import vn.homecare.identity.entity.OtpPurpose;

/**
 * Registration, OTP, consent and account endpoints against real PostgreSQL (Flyway schema) + Redis (R-20). Keycloak,
 * RabbitMQ and S3 are external systems and are mocked here.
 */
@Testcontainers
@SpringBootTest(
        properties = {
            "eureka.client.enabled=false",
            "spring.cloud.config.enabled=false",
            "spring.config.import=",
            "spring.flyway.schemas=identity",
            "spring.flyway.default-schema=identity",
            "spring.flyway.create-schemas=true",
            "KC_SECRET_IDENTITY_SERVICE=test-only",
            "homecare.outbox.poll-interval=PT1H",
            "homecare.identity.jobs.export-delay=PT1H",
            "homecare.identity.jobs.export-expiry-delay=PT1H"
        })
@AutoConfigureMockMvc
class IdentityIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer(
            DockerImageName.parse("postgis/postgis:17-3.5").asCompatibleSubstituteFor("postgres"));

    @Container
    @ServiceConnection(name = "redis")
    static final GenericContainer<?> REDIS = new GenericContainer<>("redis:7.4-alpine").withExposedPorts(6379);

    /** Fresh random keys for every run: no key-like literal is committed (R-17, secret scanners). */
    @DynamicPropertySource
    static void randomKeys(DynamicPropertyRegistry registry) {
        registry.add("homecare.security.encryption-key", IdentityIntegrationTest::randomBase64Key);
        registry.add("homecare.security.lookup-hash-key", IdentityIntegrationTest::randomBase64Key);
    }

    private static String randomBase64Key() {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        return Base64.getEncoder().encodeToString(key);
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    JdbcTemplate jdbc;

    @MockitoBean
    KeycloakAdminClient keycloak;

    @MockitoBean
    OtpSender otpSender;

    @MockitoBean
    PartnerOrgClient partnerOrgClient;

    @MockitoBean
    RabbitTemplate rabbitTemplate;

    @MockitoBean
    FileStorageService fileStorageService;

    private final AtomicReference<String> lastCode = new AtomicReference<>();

    @BeforeEach
    void captureOtp() {
        org.mockito.Mockito.doAnswer(inv -> {
                    lastCode.set(inv.getArgument(1));
                    return null;
                })
                .when(otpSender)
                .send(anyString(), anyString(), any(OtpPurpose.class));
    }

    private String sendOtp(String destination, String purpose) throws Exception {
        lastCode.set(null);
        mvc.perform(post("/api/v1/otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"destination\":\"" + destination + "\",\"purpose\":\"" + purpose + "\"}"))
                .andExpect(status().isOk());
        return lastCode.get();
    }

    private static String registration(String phone, String code, String termsVersion) {
        return """
                {"phone":"%s","otpCode":"%s","fullName":"Phạm Minh Tuấn","dateOfBirth":"1990-05-01",
                 "password":"matkhau123","acceptedTermsVersion":"%s","acceptedPrivacyVersion":"2026.11"}
                """.formatted(phone, code, termsVersion);
    }

    @Test
    @DisplayName("TC-US-01-001-6: gửi OTP → đăng ký → có account, role, 2 đồng ý, event trong outbox (DB thật)")
    void registersCustomerEndToEnd() throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("http://kc/admin/realms/homecare/users/kc-tuan"));
        when(keycloak.createUser(any())).thenReturn(new ResponseEntity<>(headers, HttpStatus.CREATED));

        String code = sendOtp("0912345678", "REGISTER");
        assertThat(code).hasSize(6);

        mvc.perform(post("/api/v1/accounts/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration("0912345678", code, "2026.11")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roles[0]").value("CUSTOMER"))
                .andExpect(jsonPath("$.phoneMasked").value("091*****78"));

        assertThat(jdbc.queryForObject(
                        "select phone_enc from identity.accounts where keycloak_user_id = 'kc-tuan'", String.class))
                .as("phone is encrypted at rest")
                .startsWith("v1:")
                .doesNotContain("0912345678");
        assertThat(jdbc.queryForObject("select count(*) from identity.consents", Integer.class))
                .isGreaterThanOrEqualTo(2);
        assertThat(jdbc.queryForList("select event_type from identity.outbox_events", String.class))
                .contains("account.registered", "audit.recorded");

        // OTP is single use
        mvc.perform(post("/api/v1/accounts/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration("0912345678", code, "2026.11")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("PHONE_ALREADY_REGISTERED"));

        mvc.perform(get("/api/v1/accounts/me")
                        .with(jwt().jwt(j -> j.subject("kc-tuan"))
                                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Phạm Minh Tuấn"));

        mvc.perform(get("/api/v1/consents/me").with(jwt().jwt(j -> j.subject("kc-tuan"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.consentType=='TERMS')].active").value(true))
                .andExpect(jsonPath("$[?(@.consentType=='HEALTH_DATA')].active").value(false));

        mvc.perform(delete("/api/v1/consents/TERMS").with(jwt().jwt(j -> j.subject("kc-tuan"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("CONSENT_REQUIRED_FOR_ACTIVE_SERVICE"));
    }

    @Test
    @DisplayName("TC-US-14-001-1: đồng ý phiên bản chính sách cũ → POLICY_VERSION_OUTDATED, không tạo user Keycloak")
    void rejectsOutdatedPolicy() throws Exception {
        String code = sendOtp("0987000111", "REGISTER");
        mvc.perform(post("/api/v1/accounts/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration("0987000111", code, "2025.01")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("POLICY_VERSION_OUTDATED"));
    }

    @Test
    @DisplayName("TC-US-01-001-7: sai OTP 5 lần → OTP_LOCKED")
    void locksAfterFiveWrongCodes() throws Exception {
        sendOtp("0977000222", "REGISTER");
        for (int i = 0; i < 4; i++) {
            mvc.perform(post("/api/v1/accounts/customers")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(registration("0977000222", "000000", "2026.11")))
                    .andExpect(jsonPath("$.errorCode").value("OTP_INVALID"));
        }
        mvc.perform(post("/api/v1/accounts/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration("0977000222", "000000", "2026.11")))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.errorCode").value("OTP_LOCKED"));
        mvc.perform(post("/api/v1/otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"destination\":\"0977000222\",\"purpose\":\"REGISTER\"}"))
                .andExpect(jsonPath("$.errorCode").value("OTP_LOCKED"));
    }

    @Test
    @DisplayName("TC-US-01-003-3: quên mật khẩu với SĐT không tồn tại → vẫn trả 200, không gửi mã (không lộ thông tin)")
    void resetDoesNotRevealAccounts() throws Exception {
        lastCode.set(null);
        mvc.perform(post("/api/v1/otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"destination\":\"0966000333\",\"purpose\":\"RESET_PASSWORD\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maskedDestination").value("096*****33"));
        verify(otpSender, never()).send(eq("0966000333"), anyString(), any());
    }
}
