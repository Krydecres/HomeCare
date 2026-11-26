package vn.homecare.identity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Browser/device info of a Keycloak SSO session, reported by the gateway right after login (US-01-006, DD-0020,
 * DD-0021). {@code sessionRefHash} = hash of the Keycloak session id ({@code sid}); the IP is stored only as a hash.
 */
@Entity
@Table(name = "login_sessions")
@Getter
public class LoginSession extends BaseEntity {

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "session_ref_hash", nullable = false, unique = true, length = 64)
    private String sessionRefHash;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "last_active_at", nullable = false)
    private Instant lastActiveAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected LoginSession() {}

    public LoginSession(UUID accountId, String sessionRefHash, String userAgent, String ipHash, Instant at) {
        this.accountId = accountId;
        this.sessionRefHash = sessionRefHash;
        this.userAgent = userAgent == null || userAgent.length() <= 255 ? userAgent : userAgent.substring(0, 255);
        this.ipHash = ipHash;
        this.lastActiveAt = at;
    }

    public void touch(Instant at) {
        this.lastActiveAt = at;
    }

    public void revoke(Instant at) {
        this.revokedAt = at;
    }
}
