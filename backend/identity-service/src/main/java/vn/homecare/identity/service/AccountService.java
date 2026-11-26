package vn.homecare.identity.service;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.security.oauth2.jwt.Jwt;
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

/** Accounts, sessions and account lifecycle (EP01, US-13-003, US-14-003, US-14-007). */
public interface AccountService {

    /** US-01-001 / API-SV04-002. */
    AccountResponse registerCustomer(RegisterCustomerRequest request);

    /** US-01-003 / API-SV04-003: new password, then every session is signed out. */
    void resetPassword(ResetPasswordRequest request);

    /** API-SV04-005. */
    AccountResponse getMine(Jwt jwt);

    /** US-01-004 / API-SV04-004. */
    AccountResponse registerCaregiver(Jwt jwt, RegisterCaregiverRequest request);

    /** US-01-006 / API-SV04-006. */
    List<LoginSessionResponse> listSessions(Jwt jwt);

    /** API-SV04-022: called by the gateway right after login to remember the browser of this SSO session. */
    void registerCurrentSession(Jwt jwt, String userAgent, String clientIp);

    /** API-SV04-007: {@code sessionId} = a Keycloak session id, or {@code all}. */
    void revokeSession(Jwt jwt, String sessionId);

    /** US-14-003 / API-SV04-019: starts the 30-day waiting period. */
    AccountDeletionResponse requestDeletion(Jwt jwt, DeleteAccountRequest request);

    /** API-SV04-024. */
    AccountResponse cancelDeletion(Jwt jwt);

    /** Job: anonymizes accounts whose waiting period ended. Returns how many. */
    int anonymizeDueAccounts();

    /** US-13-003 / API-SV04-012. */
    Page<AccountSummaryResponse> search(AccountSearchRequest request);

    /** US-01-007 / API-SV04-011. */
    AccountResponse createInternal(Jwt jwt, CreateInternalAccountRequest request);

    /** US-01-008 / API-SV04-013. */
    AccountResponse lock(Jwt jwt, UUID accountId, LockAccountRequest request);

    /** US-01-008 / API-SV04-014. */
    AccountResponse unlock(Jwt jwt, UUID accountId, UnlockAccountRequest request);

    /** US-14-007 / API-SV04-025: signs out every account holding a role. Returns how many accounts. */
    int revokeSessionsByRole(Jwt jwt, SessionRevocationRequest request);

    /**
     * The account of the JWT's user; creates the row on first use for users created directly in Keycloak (dev users,
     * bootstrap admin). Service-layer only – never returned by a controller (R-06).
     */
    Account resolveCurrent(Jwt jwt);
}
