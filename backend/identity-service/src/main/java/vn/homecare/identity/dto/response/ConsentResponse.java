package vn.homecare.identity.dto.response;

import java.time.Instant;

/**
 * One purpose of US-14-001. {@code needsReconsent} = the accepted version is older than the current policy version
 * (WF-S-09 asks again).
 */
public record ConsentResponse(
        String consentType,
        boolean mandatory,
        boolean active,
        String acceptedVersion,
        String currentVersion,
        boolean needsReconsent,
        Instant acceptedAt,
        Instant withdrawnAt) {}
