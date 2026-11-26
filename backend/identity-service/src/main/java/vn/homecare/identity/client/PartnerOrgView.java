package vn.homecare.identity.client;

import java.util.UUID;

/** What identity-service needs to know about a partner hospital (API-SV06-038, caregiver-service). */
public record PartnerOrgView(UUID id, String status) {

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }
}
