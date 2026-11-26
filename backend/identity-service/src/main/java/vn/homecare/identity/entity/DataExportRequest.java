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
import vn.homecare.common.security.EncryptedStringConverter;

/** "Tải dữ liệu của tôi" request (US-14-002, DD-0024): built in the background, link valid 7 days. */
@Entity
@Table(name = "data_export_requests")
@Getter
public class DataExportRequest extends BaseEntity {

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DataExportStatus status;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "file_key")
    private String fileKey;

    @Column(name = "expires_at")
    private Instant expiresAt;

    protected DataExportRequest() {}

    public DataExportRequest(UUID accountId) {
        this.accountId = accountId;
        this.status = DataExportStatus.PENDING;
    }

    public void ready(String fileKey, Instant expiresAt) {
        this.status = DataExportStatus.READY;
        this.fileKey = fileKey;
        this.expiresAt = expiresAt;
    }

    public void expire() {
        this.status = DataExportStatus.EXPIRED;
    }
}
