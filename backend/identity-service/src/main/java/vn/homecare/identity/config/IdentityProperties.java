package vn.homecare.identity.config;

import java.time.Duration;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;
import vn.homecare.identity.entity.ConsentType;

/**
 * Settings {@code homecare.identity.*} of identity-service.
 *
 * @param policyVersions current version of each policy text (US-14-001: a newer version asks users to consent again)
 * @param otp OTP rules of US-01-001 / US-01-003
 * @param deletionGracePeriod waiting time before an account is anonymized (US-14-003: 30 days)
 * @param keycloakAdminUrl {@code <keycloak>/admin/realms/homecare}
 * @param inviteLinkLifespan validity of the "set password + MFA" email for internal accounts (US-01-007)
 * @param export data export settings (US-14-002)
 */
@ConfigurationProperties("homecare.identity")
public record IdentityProperties(
        Map<ConsentType, String> policyVersions,
        Otp otp,
        Duration deletionGracePeriod,
        String keycloakAdminUrl,
        Duration inviteLinkLifespan,
        Export export) {

    /**
     * @param ttl OTP validity (5 minutes)
     * @param maxSendsPerHour per destination (5)
     * @param maxAttempts wrong codes before lock (5)
     * @param lockDuration lock after too many wrong codes (30 minutes)
     * @param logCodes dev/demo only: print codes to the log (mock SMS)
     */
    public record Otp(Duration ttl, int maxSendsPerHour, int maxAttempts, Duration lockDuration, boolean logCodes) {}

    /**
     * @param bucket private bucket of the S3-compatible storage
     * @param linkValidity presigned download link validity (7 days)
     */
    public record Export(String bucket, Duration linkValidity) {}

    public String versionOf(ConsentType type) {
        return policyVersions == null ? null : policyVersions.get(type);
    }
}
