package vn.homecare.identity.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.oauth2.jwt.Jwt;
import vn.homecare.identity.dto.request.GrantConsentRequest;
import vn.homecare.identity.dto.response.ConsentResponse;
import vn.homecare.identity.entity.ConsentType;

/** Consent per purpose with proof (US-14-001, Nghị định 13/2023). */
public interface ConsentService {

    /** API-SV04-015: one entry per purpose, with the current policy version and whether to consent again. */
    List<ConsentResponse> listMine(Jwt jwt);

    /** API-SV04-016. Only the current policy version can be accepted (POLICY_VERSION_OUTDATED). */
    ConsentResponse grant(Jwt jwt, GrantConsentRequest request);

    /** API-SV04-017. TERMS/PRIVACY cannot be withdrawn while the account exists (CONSENT_REQUIRED_FOR_ACTIVE_SERVICE). */
    void withdraw(Jwt jwt, ConsentType type);

    /** Records several consents at registration; each version must be the current one. */
    void recordAll(UUID accountId, Map<ConsentType, String> acceptedVersions);
}
