package vn.homecare.identity.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.data.domain.Limit;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;
import vn.homecare.common.audit.AuditEventRecorder;
import vn.homecare.common.exception.BusinessException;
import vn.homecare.common.outbox.OutboxEventRecorder;
import vn.homecare.common.storage.FileStorageService;
import vn.homecare.identity.config.IdentityProperties;
import vn.homecare.identity.dto.request.DataExportOtpRequest;
import vn.homecare.identity.dto.response.DataExportResponse;
import vn.homecare.identity.entity.Account;
import vn.homecare.identity.entity.DataExportRequest;
import vn.homecare.identity.entity.DataExportStatus;
import vn.homecare.identity.entity.OtpPurpose;
import vn.homecare.identity.repository.AccountRepository;
import vn.homecare.identity.repository.AccountRoleRepository;
import vn.homecare.identity.repository.ConsentRepository;
import vn.homecare.identity.repository.DataExportRequestRepository;
import vn.homecare.identity.repository.LoginSessionRepository;
import vn.homecare.identity.service.AccountService;
import vn.homecare.identity.service.DataExportService;
import vn.homecare.identity.service.OtpService;

/**
 * Builds the identity part of "dữ liệu của tôi" (account, roles, consents, sessions). Other services add their part
 * when they handle event {@code data-export.requested} (their stories); the PDF summary is OQ-045.
 */
@Service
public class DataExportServiceImpl implements DataExportService {

    private static final int BATCH = 5;

    private final DataExportRequestRepository exportRepository;
    private final AccountRepository accountRepository;
    private final AccountRoleRepository accountRoleRepository;
    private final ConsentRepository consentRepository;
    private final LoginSessionRepository loginSessionRepository;
    private final AccountService accountService;
    private final OtpService otpService;
    private final FileStorageService storage;
    private final OutboxEventRecorder outbox;
    private final AuditEventRecorder audit;
    private final JsonMapper jsonMapper;
    private final IdentityProperties properties;
    private final Clock clock;

    public DataExportServiceImpl(
            DataExportRequestRepository exportRepository,
            AccountRepository accountRepository,
            AccountRoleRepository accountRoleRepository,
            ConsentRepository consentRepository,
            LoginSessionRepository loginSessionRepository,
            AccountService accountService,
            OtpService otpService,
            FileStorageService storage,
            OutboxEventRecorder outbox,
            AuditEventRecorder audit,
            JsonMapper jsonMapper,
            IdentityProperties properties,
            Clock clock) {
        this.exportRepository = exportRepository;
        this.accountRepository = accountRepository;
        this.accountRoleRepository = accountRoleRepository;
        this.consentRepository = consentRepository;
        this.loginSessionRepository = loginSessionRepository;
        this.accountService = accountService;
        this.otpService = otpService;
        this.storage = storage;
        this.outbox = outbox;
        this.audit = audit;
        this.jsonMapper = jsonMapper;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    @Transactional
    public DataExportResponse request(Jwt jwt, DataExportOtpRequest request) {
        Account account = accountService.resolveCurrent(jwt);
        if (exportRepository.existsByAccountIdAndStatus(account.getId(), DataExportStatus.PENDING)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT, "EXPORT_IN_PROGRESS", "Yêu cầu trước đang được xử lý, vui lòng chờ.");
        }
        String destination = account.getPhone() != null ? account.getPhone() : account.getEmail();
        otpService.verify(destination, OtpPurpose.REAUTH, request.otpCode());
        DataExportRequest export = exportRepository.save(new DataExportRequest(account.getId()));
        outbox.record(
                "DataExport",
                export.getId(),
                "data-export.requested",
                Map.of("exportId", export.getId(), "accountId", account.getId()));
        audit.record("DATA_EXPORT_REQUESTED", "Account", account.getId(), null);
        return toResponse(export);
    }

    @Override
    @Transactional(readOnly = true)
    public DataExportResponse latest(Jwt jwt) {
        Account account = accountService.resolveCurrent(jwt);
        return exportRepository
                .findFirstByAccountIdOrderByCreatedAtDesc(account.getId())
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public int buildPending() {
        List<DataExportRequest> pending = exportRepository.findPending(Limit.of(BATCH));
        for (DataExportRequest export : pending) {
            Account account = accountRepository.findById(export.getAccountId()).orElseThrow();
            String key = "exports/" + account.getId() + "/" + export.getId() + ".zip";
            storage.put(bucket(), key, zip(account), "application/zip");
            export.ready(key, Instant.now(clock).plus(properties.export().linkValidity()));
        }
        return pending.size();
    }

    @Override
    @Transactional
    public int expireOld() {
        List<DataExportRequest> old =
                exportRepository.findByStatusAndExpiresAtBefore(DataExportStatus.READY, Instant.now(clock));
        for (DataExportRequest export : old) {
            storage.delete(bucket(), export.getFileKey());
            export.expire();
        }
        return old.size();
    }

    private DataExportResponse toResponse(DataExportRequest export) {
        String url = null;
        Instant now = Instant.now(clock);
        if (export.getStatus() == DataExportStatus.READY
                && export.getExpiresAt().isAfter(now)) {
            url = storage.presignedGetUrl(bucket(), export.getFileKey(), Duration.between(now, export.getExpiresAt()));
        }
        return new DataExportResponse(
                export.getId(), export.getStatus().name(), export.getCreatedAt(), export.getExpiresAt(), url);
    }

    private byte[] zip(Account account) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("accountId", account.getId());
        data.put("displayName", account.getDisplayName());
        data.put("phone", account.getPhone());
        data.put("email", account.getEmail());
        data.put("status", account.getStatus());
        data.put("createdAt", account.getCreatedAt());
        data.put(
                "roles",
                accountRoleRepository.findByAccountId(account.getId()).stream()
                        .map(r -> Map.of(
                                "role", r.getRole().name(),
                                "grantedAt", r.getGrantedAt().toString(),
                                "revokedAt", String.valueOf(r.getRevokedAt())))
                        .toList());
        data.put(
                "consents",
                consentRepository.findByAccountIdOrderByAcceptedAtDesc(account.getId()).stream()
                        .map(c -> Map.of(
                                "purpose", c.getConsentType().name(),
                                "policyVersion", c.getPolicyVersion(),
                                "acceptedAt", c.getAcceptedAt().toString(),
                                "withdrawnAt", String.valueOf(c.getWithdrawnAt())))
                        .toList());
        data.put(
                "loginSessions",
                loginSessionRepository.findByAccountId(account.getId()).stream()
                        .map(s -> Map.of(
                                "userAgent", String.valueOf(s.getUserAgent()),
                                "lastActiveAt", s.getLastActiveAt().toString()))
                        .toList());
        try (ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                ZipOutputStream zip = new ZipOutputStream(bytes)) {
            zip.putNextEntry(new ZipEntry("identity/account.json"));
            zip.write(jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(data));
            zip.closeEntry();
            zip.putNextEntry(new ZipEntry("README.txt"));
            zip.write(("Du lieu ca nhan HomeCare dang luu ve ban (Nghi dinh 13/2023).\n"
                            + "identity/: tai khoan, vai tro, dong y xu ly du lieu, phien dang nhap.\n")
                    .getBytes(StandardCharsets.UTF_8));
            zip.closeEntry();
            zip.finish();
            return bytes.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Cannot build export", e);
        }
    }

    private String bucket() {
        return properties.export().bucket();
    }
}
