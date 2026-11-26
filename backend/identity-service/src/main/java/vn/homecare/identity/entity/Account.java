package vn.homecare.identity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.homecare.common.security.EncryptedStringConverter;

/**
 * A HomeCare account (DD-0009 → DD-0013, DD-0141, DD-0142). Login credentials live in Keycloak; this row links the
 * Keycloak user, keeps encrypted contact data and the lifecycle status. No profile/health data here (09: identity does
 * not own customer/caregiver profiles).
 */
@Entity
@Table(name = "accounts")
@Getter
public class Account extends BaseEntity {

    @Column(name = "keycloak_user_id", nullable = false, unique = true, length = 64)
    private String keycloakUserId;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "phone_enc")
    private String phone;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "phone_hash", length = 64)
    private String phoneHash;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "email_enc")
    private String email;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "email_hash", length = 64)
    private String emailHash;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "display_name_enc")
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AccountStatus status;

    @Column(name = "locked_reason")
    private String lockedReason;

    @Column(name = "deletion_requested_at")
    private Instant deletionRequestedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    protected Account() {}

    public Account(
            UUID id,
            String keycloakUserId,
            String phone,
            String phoneHash,
            String email,
            String emailHash,
            String displayName,
            UUID createdBy) {
        super(id);
        this.keycloakUserId = keycloakUserId;
        this.phone = phone;
        this.phoneHash = phoneHash;
        this.email = email;
        this.emailHash = emailHash;
        this.displayName = displayName;
        this.status = AccountStatus.ACTIVE;
        this.createdBy = createdBy;
    }

    public void lock(String reason, UUID by) {
        this.status = AccountStatus.LOCKED;
        this.lockedReason = reason;
        this.updatedBy = by;
    }

    public void unlock(UUID by) {
        this.status = AccountStatus.ACTIVE;
        this.lockedReason = null;
        this.updatedBy = by;
    }

    public void requestDeletion(Instant at) {
        this.status = AccountStatus.PENDING_DELETION;
        this.deletionRequestedAt = at;
    }

    public void cancelDeletion() {
        this.status = AccountStatus.ACTIVE;
        this.deletionRequestedAt = null;
    }

    /** Anonymizes the row (US-14-003): contact data removed, only the id stays for references from other services. */
    public void anonymize(Instant at) {
        this.status = AccountStatus.DELETED;
        this.deletedAt = at;
        this.phone = null;
        this.phoneHash = null;
        this.email = null;
        this.emailHash = null;
        this.displayName = null;
        this.lockedReason = null;
        this.keycloakUserId = "deleted:" + getId();
    }
}
