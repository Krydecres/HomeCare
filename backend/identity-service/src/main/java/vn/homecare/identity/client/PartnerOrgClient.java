package vn.homecare.identity.client;

import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;

/** caregiver-service internal API (API-SV06-038, owner TV4): status of a partner hospital (US-01-004). */
public interface PartnerOrgClient {

    @GetExchange("/internal/v1/partner-orgs/{id}")
    PartnerOrgView getPartnerOrg(@PathVariable UUID id);
}
