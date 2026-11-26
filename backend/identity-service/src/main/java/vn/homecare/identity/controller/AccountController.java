package vn.homecare.identity.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.homecare.identity.dto.request.DataExportOtpRequest;
import vn.homecare.identity.dto.request.DeleteAccountRequest;
import vn.homecare.identity.dto.request.RegisterCaregiverRequest;
import vn.homecare.identity.dto.request.RegisterCustomerRequest;
import vn.homecare.identity.dto.request.ResetPasswordRequest;
import vn.homecare.identity.dto.response.AccountDeletionResponse;
import vn.homecare.identity.dto.response.AccountResponse;
import vn.homecare.identity.dto.response.DataExportResponse;
import vn.homecare.identity.dto.response.LoginSessionResponse;
import vn.homecare.identity.service.AccountService;
import vn.homecare.identity.service.DataExportService;

/** Account of the user (API-SV04-002 → 007, 018, 019, 022 → 024). */
@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private static final String SIGNED_IN = "isAuthenticated()";
    private static final String NOT_INTERNAL = "isAuthenticated() and !hasAnyRole('ADMIN', 'DISPATCHER', 'ACCOUNTANT')";

    private final AccountService accountService;
    private final DataExportService dataExportService;

    public AccountController(AccountService accountService, DataExportService dataExportService) {
        this.accountService = accountService;
        this.dataExportService = dataExportService;
    }

    @PostMapping("/customers")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("permitAll()")
    public AccountResponse registerCustomer(@Valid @RequestBody RegisterCustomerRequest request) {
        return accountService.registerCustomer(request);
    }

    @PostMapping("/password-reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("permitAll()")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        accountService.resetPassword(request);
    }

    @GetMapping("/me")
    @PreAuthorize(SIGNED_IN)
    public AccountResponse getMyAccount(@AuthenticationPrincipal Jwt jwt) {
        return accountService.getMine(jwt);
    }

    @PostMapping("/me/caregiver-registration")
    @PreAuthorize("hasRole('CUSTOMER')")
    public AccountResponse registerCaregiver(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody RegisterCaregiverRequest request) {
        return accountService.registerCaregiver(jwt, request);
    }

    @GetMapping("/me/sessions")
    @PreAuthorize(SIGNED_IN)
    public List<LoginSessionResponse> listSessions(@AuthenticationPrincipal Jwt jwt) {
        return accountService.listSessions(jwt);
    }

    @PostMapping("/me/sessions/current")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(SIGNED_IN)
    public void registerCurrentSession(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest request) {
        accountService.registerCurrentSession(jwt, userAgent, clientIp(request));
    }

    @DeleteMapping("/me/sessions/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(SIGNED_IN)
    public void revokeSession(@AuthenticationPrincipal Jwt jwt, @PathVariable String sessionId) {
        accountService.revokeSession(jwt, sessionId);
    }

    @PostMapping("/me/data-exports")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @PreAuthorize(SIGNED_IN)
    public DataExportResponse requestDataExport(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody DataExportOtpRequest request) {
        return dataExportService.request(jwt, request);
    }

    @GetMapping("/me/data-exports/latest")
    @PreAuthorize(SIGNED_IN)
    public ResponseEntity<DataExportResponse> getLatestDataExport(@AuthenticationPrincipal Jwt jwt) {
        DataExportResponse latest = dataExportService.latest(jwt);
        return latest == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(latest);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @PreAuthorize(NOT_INTERNAL)
    public AccountDeletionResponse requestDeletion(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody DeleteAccountRequest request) {
        return accountService.requestDeletion(jwt, request);
    }

    @PostMapping("/me/deletion-cancellation")
    @PreAuthorize(NOT_INTERNAL)
    public AccountResponse cancelDeletion(@AuthenticationPrincipal Jwt jwt) {
        return accountService.cancelDeletion(jwt);
    }

    /** First X-Forwarded-For hop (set by nginx/gateway), else the socket address. Only stored hashed. */
    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }
}
