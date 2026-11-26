package vn.homecare.identity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;

/** A role held by an account, with who granted/revoked it and when (DD-0014 → DD-0017). Rows are never deleted. */
@Entity
@Table(name = "account_roles")
@Getter
public class AccountRole extends BaseEntity {

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private AppRole role;

    @Column(name = "partner_org_id")
    private UUID partnerOrgId;

    @Column(name = "granted_by")
    private UUID grantedBy;

    @Column(name = "granted_at", nullable = false)
    private Instant grantedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "revoked_reason")
    private String revokedReason;

    protected AccountRole() {}

    public AccountRole(UUID accountId, AppRole role, UUID partnerOrgId, UUID grantedBy, Instant grantedAt) {
        this.accountId = accountId;
        this.role = role;
        this.partnerOrgId = partnerOrgId;
        this.grantedBy = grantedBy;
        this.grantedAt = grantedAt;
    }

    public boolean isActive() {
        return revokedAt == null;
    }

    public void revoke(Instant at, String reason) {
        this.revokedAt = at;
        this.revokedReason = reason;
    }
}
