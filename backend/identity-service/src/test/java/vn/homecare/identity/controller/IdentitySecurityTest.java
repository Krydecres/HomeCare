package vn.homecare.identity.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import vn.homecare.common.config.CommonSecurityAutoConfiguration;
import vn.homecare.common.config.CommonWebAutoConfiguration;
import vn.homecare.identity.dto.response.OtpSentResponse;
import vn.homecare.identity.service.AccountService;
import vn.homecare.identity.service.ConsentService;
import vn.homecare.identity.service.DataExportService;
import vn.homecare.identity.service.OtpService;
import vn.homecare.identity.service.RoleGrantService;
import vn.homecare.identity.service.WebPushSubscriptionService;

/**
 * Permissions of every identity endpoint (13_RBAC, US-15-005, R-35): a role that is not allowed gets 403, anonymous
 * gets 401 except the "Khách vãng lai" APIs. Security test – owner TV1.
 */
@WebMvcTest({
    AccountController.class,
    AdminAccountController.class,
    ConsentController.class,
    DeviceController.class,
    InternalRoleController.class,
    OtpController.class
})
@ImportAutoConfiguration({CommonSecurityAutoConfiguration.class, CommonWebAutoConfiguration.class})
@TestPropertySource(
        properties = {
            "homecare.security.public-endpoints[0]=POST /api/v1/otp",
            "homecare.security.public-endpoints[1]=POST /api/v1/accounts/customers",
            "homecare.security.public-endpoints[2]=POST /api/v1/accounts/password-reset"
        })
class IdentitySecurityTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    JwtDecoder jwtDecoder;

    @MockitoBean
    AccountService accountService;

    @MockitoBean
    OtpService otpService;

    @MockitoBean
    ConsentService consentService;

    @MockitoBean
    DataExportService dataExportService;

    @MockitoBean
    WebPushSubscriptionService webPushSubscriptionService;

    @MockitoBean
    RoleGrantService roleGrantService;

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder builder, String body) {
        return builder.contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private static org.springframework.test.web.servlet.request.RequestPostProcessor as(String... roles) {
        return jwt().authorities(java.util.Arrays.stream(roles)
                .map(r -> (org.springframework.security.core.GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r))
                .toList());
    }

    @Test
    @DisplayName("TC-US-01-001-1: khách vãng lai gọi được API gửi OTP (permitAll đúng hợp đồng)")
    void anonymousCanSendOtp() throws Exception {
        when(otpService.send(any(), any())).thenReturn(new OtpSentResponse("091*****78", 300));
        mvc.perform(json(post("/api/v1/otp"), "{\"destination\":\"0912345678\",\"purpose\":\"REGISTER\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expiresInSeconds").value(300));
    }

    @Test
    @DisplayName("TC-US-01-002-6: chưa đăng nhập gọi /accounts/me → 401")
    void anonymousCannotReadAccount() throws Exception {
        mvc.perform(get("/api/v1/accounts/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC-US-01-007-1: CUSTOMER, DISPATCHER, ACCOUNTANT tạo tài khoản nội bộ → 403")
    void onlyAdminCreatesInternalAccounts() throws Exception {
        String body = "{\"email\":\"a@homecare.test\",\"fullName\":\"A\",\"roles\":[\"ADMIN\"]}";
        for (String role : new String[] {"CUSTOMER", "DISPATCHER", "ACCOUNTANT", "PARTNER_ORG", "CAREGIVER"}) {
            mvc.perform(json(post("/api/v1/admin/accounts"), body).with(as(role)))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("TC-US-01-008-1: không phải ADMIN thì không khóa/mở khóa / tìm người dùng được")
    void onlyAdminLocks() throws Exception {
        UUID id = UUID.randomUUID();
        mvc.perform(json(post("/api/v1/admin/accounts/" + id + "/lock"), "{\"reason\":\"x\"}")
                        .with(as("DISPATCHER")))
                .andExpect(status().isForbidden());
        mvc.perform(json(post("/api/v1/admin/accounts/" + id + "/unlock"), "{\"reason\":\"x\"}")
                        .with(as("CUSTOMER")))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/accounts").with(as("ACCOUNTANT"))).andExpect(status().isForbidden());
        mvc.perform(json(post("/api/v1/admin/sessions/revocations"), "{\"role\":\"CUSTOMER\",\"reason\":\"x\"}")
                        .with(as("DISPATCHER")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("TC-US-01-009-2: CAREGIVER_PENDING (chưa có CUSTOMER) không tự đăng ký nhân viên lần nữa → 403")
    void caregiverRegistrationNeedsCustomer() throws Exception {
        String body = "{\"staffType\":\"NURSE\",\"partnerOrgId\":\"" + UUID.randomUUID()
                + "\",\"dateOfBirth\":\"1990-01-01\",\"acceptedCaregiverCodeVersion\":\"2026.11\","
                + "\"acceptedPartnerSharingVersion\":\"2026.11\"}";
        mvc.perform(json(post("/api/v1/accounts/me/caregiver-registration"), body)
                        .with(as("CAREGIVER_PENDING")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("TC-US-03-016-1: không ai ngoài service account của caregiver-service cấp được role CAREGIVER")
    void onlyCaregiverServiceGrantsRoles() throws Exception {
        String body = "{\"role\":\"CAREGIVER\",\"partnerOrgId\":\"" + UUID.randomUUID() + "\"}";
        String path = "/internal/v1/accounts/" + UUID.randomUUID() + "/roles";
        mvc.perform(json(post(path), body).with(as("ADMIN"))).andExpect(status().isForbidden());
        mvc.perform(json(post(path), body)
                        .with(jwt().jwt(j -> j.claim("azp", "booking-service"))
                                .authorities(new SimpleGrantedAuthority("ROLE_SYSTEM"))))
                .andExpect(status().isForbidden());
        mvc.perform(json(post(path), body)
                        .with(jwt().jwt(j -> j.claim("azp", "caregiver-service"))
                                .authorities(new SimpleGrantedAuthority("ROLE_SYSTEM"))))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("TC-US-14-003-1: tài khoản nội bộ không tự xóa tài khoản → 403")
    void internalAccountsCannotSelfDelete() throws Exception {
        mvc.perform(json(delete("/api/v1/accounts/me"), "{\"otpCode\":\"123456\"}")
                        .with(as("ADMIN")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("TC-US-01-001-2: request đăng ký không hợp lệ → 400 VALIDATION_FAILED")
    void registerValidation() throws Exception {
        mvc.perform(json(post("/api/v1/accounts/customers"), "{\"phone\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"));
    }
}
