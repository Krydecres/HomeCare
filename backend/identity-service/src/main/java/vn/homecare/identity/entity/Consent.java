package vn.homecare.identity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;

/**
 * Proof of consent (US-14-001, Nghị định 13/2023): who, which purpose, which policy version, when, through which
 * channel (DD-0018, DD-0019, DD-0143). Withdrawal sets {@code withdrawnAt}; a new consent is a new row.
 */
@Entity
@Table(name = "consents")
@Getter
public class Consent extends BaseEntity {

    public static final String CHANNEL_WEB = "WEB";

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_type", nullable = false, length = 40)
    private ConsentType consentType;

    @Column(name = "policy_version", nullable = false, length = 20)
    private String policyVersion;

    @Column(name = "channel", nullable = false, length = 20)
    private String channel;

    @Column(name = "accepted_at", nullable = false)
    private Instant acceptedAt;

    @Column(name = "withdrawn_at")
    private Instant withdrawnAt;

    protected Consent() {}

    public Consent(UUID accountId, ConsentType consentType, String policyVersion, String channel, Instant acceptedAt) {
        this.accountId = accountId;
        this.consentType = consentType;
        this.policyVersion = policyVersion;
        this.channel = channel;
        this.acceptedAt = acceptedAt;
    }

    public boolean isActive() {
        return withdrawnAt == null;
    }

    public void withdraw(Instant at) {
        this.withdrawnAt = at;
    }
}
