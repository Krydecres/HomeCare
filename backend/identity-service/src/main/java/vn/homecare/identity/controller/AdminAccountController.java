package vn.homecare.identity.controller;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.homecare.identity.dto.request.AccountSearchRequest;
import vn.homecare.identity.dto.request.CreateInternalAccountRequest;
import vn.homecare.identity.dto.request.LockAccountRequest;
import vn.homecare.identity.dto.request.SessionRevocationRequest;
import vn.homecare.identity.dto.request.UnlockAccountRequest;
import vn.homecare.identity.dto.response.AccountResponse;
import vn.homecare.identity.dto.response.AccountSummaryResponse;
import vn.homecare.identity.service.AccountService;

/** Admin user management (API-SV04-011 → 014, 025; US-01-007, US-01-008, US-13-003, US-14-007). ADMIN only. */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAccountController {

    private final AccountService accountService;

    public AdminAccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/accounts")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AccountSummaryResponse> searchAccounts(@Valid AccountSearchRequest request) {
        return accountService.search(request);
    }

    @PostMapping("/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse createInternalAccount(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateInternalAccountRequest request) {
        return accountService.createInternal(jwt, request);
    }

    @PostMapping("/accounts/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse lockAccount(
            @AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody LockAccountRequest request) {
        return accountService.lock(jwt, id, request);
    }

    @PostMapping("/accounts/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse unlockAccount(
            @AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody UnlockAccountRequest request) {
        return accountService.unlock(jwt, id, request);
    }

    @PostMapping("/sessions/revocations")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Integer> revokeSessionsByRole(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SessionRevocationRequest request) {
        return Map.of("revokedAccounts", accountService.revokeSessionsByRole(jwt, request));
    }
}
