package vn.homecare.identity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import vn.homecare.common.security.EncryptedStringConverter;

/** Web Push subscription of a browser (US-01-006, DD-0022, DD-0023). Endpoint and keys are encrypted. */
@Entity
@Table(name = "web_push_subscriptions")
@Getter
public class WebPushSubscription extends BaseEntity {

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "endpoint_enc", nullable = false)
    private String endpoint;

    @Column(name = "endpoint_hash", nullable = false, unique = true, length = 64)
    private String endpointHash;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "p256dh_enc", nullable = false)
    private String p256dh;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "auth_secret_enc", nullable = false)
    private String authSecret;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    protected WebPushSubscription() {}

    public WebPushSubscription(
            UUID accountId, String endpoint, String endpointHash, String p256dh, String authSecret, Instant at) {
        this.accountId = accountId;
        this.endpoint = endpoint;
        this.endpointHash = endpointHash;
        this.p256dh = p256dh;
        this.authSecret = authSecret;
        this.lastSeenAt = at;
    }

    /** Same browser subscribed again (keys may rotate, or another account logged in on it). */
    public void refresh(UUID accountId, String p256dh, String authSecret, Instant at) {
        this.accountId = accountId;
        this.p256dh = p256dh;
        this.authSecret = authSecret;
        this.lastSeenAt = at;
    }
}
