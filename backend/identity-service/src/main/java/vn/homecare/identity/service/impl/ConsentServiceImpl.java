package vn.homecare.identity.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.homecare.common.audit.AuditEventRecorder;
import vn.homecare.common.exception.BusinessException;
import vn.homecare.identity.config.IdentityProperties;
import vn.homecare.identity.dto.request.GrantConsentRequest;
import vn.homecare.identity.dto.response.ConsentResponse;
import vn.homecare.identity.entity.Account;
import vn.homecare.identity.entity.Consent;
import vn.homecare.identity.entity.ConsentType;
import vn.homecare.identity.repository.ConsentRepository;
import vn.homecare.identity.service.AccountService;
import vn.homecare.identity.service.ConsentService;

@Service
public class ConsentServiceImpl implements ConsentService {

    private final ConsentRepository consentRepository;
    private final AccountService accountService;
    private final IdentityProperties properties;
    private final AuditEventRecorder audit;
    private final Clock clock;

    public ConsentServiceImpl(
            ConsentRepository consentRepository,
            AccountService accountService,
            IdentityProperties properties,
            AuditEventRecorder audit,
            Clock clock) {
        this.consentRepository = consentRepository;
        this.accountService = accountService;
        this.properties = properties;
        this.audit = audit;
        this.clock = clock;
    }

    @Override
    @Transactional
    public List<ConsentResponse> listMine(Jwt jwt) {
        Account account = accountService.resolveCurrent(jwt);
        List<Consent> all = consentRepository.findByAccountIdOrderByAcceptedAtDesc(account.getId());
        List<ConsentResponse> result = new ArrayList<>();
        for (ConsentType type : ConsentType.values()) {
            Optional<Consent> latest =
                    all.stream().filter(c -> c.getConsentType() == type).findFirst();
            String current = properties.versionOf(type);
            boolean active = latest.map(Consent::isActive).orElse(false);
            result.add(new ConsentResponse(
                    type.name(),
                    type.isMandatory(),
                    active,
                    latest.map(Consent::getPolicyVersion).orElse(null),
                    current,
                    active && current != null && !current.equals(latest.get().getPolicyVersion()),
                    latest.map(Consent::getAcceptedAt).orElse(null),
                    latest.map(Consent::getWithdrawnAt).orElse(null)));
        }
        return result;
    }

    @Override
    @Transactional
    public ConsentResponse grant(Jwt jwt, GrantConsentRequest request) {
        Account account = accountService.resolveCurrent(jwt);
        record(account.getId(), request.consentType(), request.policyVersion());
        return listMine(jwt).stream()
                .filter(c -> c.consentType().equals(request.consentType().name()))
                .findFirst()
                .orElseThrow();
    }

    @Override
    @Transactional
    public void withdraw(Jwt jwt, ConsentType type) {
        if (type.isMandatory()) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "CONSENT_REQUIRED_FOR_ACTIVE_SERVICE",
                    "Không thể rút đồng ý bắt buộc khi còn dùng tài khoản. Hãy yêu cầu xóa tài khoản.");
        }
        Account account = accountService.resolveCurrent(jwt);
        Instant now = Instant.now(clock);
        consentRepository
                .findByAccountIdAndConsentTypeAndWithdrawnAtIsNull(account.getId(), type)
                .forEach(c -> c.withdraw(now));
        audit.record("CONSENT_WITHDRAWN", "Account", account.getId(), type.name());
    }

    @Override
    @Transactional
    public void recordAll(UUID accountId, Map<ConsentType, String> acceptedVersions) {
        acceptedVersions.forEach((type, version) -> record(accountId, type, version));
    }

    private void record(UUID accountId, ConsentType type, String version) {
        String current = properties.versionOf(type);
        if (current == null || !current.equals(version)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "POLICY_VERSION_OUTDATED",
                    "Văn bản " + type.name() + " đã có phiên bản mới, vui lòng đọc và đồng ý lại.");
        }
        Instant now = Instant.now(clock);
        consentRepository
                .findByAccountIdAndConsentTypeAndWithdrawnAtIsNull(accountId, type)
                .forEach(c -> c.withdraw(now));
        consentRepository.save(new Consent(accountId, type, version, Consent.CHANNEL_WEB, now));
        audit.record("CONSENT_GRANTED", "Account", accountId, type.name() + " v" + version);
    }
}
