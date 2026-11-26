package vn.homecare.identity.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.homecare.common.exception.BusinessException;
import vn.homecare.common.security.LookupHasher;
import vn.homecare.identity.dto.request.WebPushSubscriptionRequest;
import vn.homecare.identity.dto.response.WebPushSubscriptionResponse;
import vn.homecare.identity.entity.Account;
import vn.homecare.identity.entity.WebPushSubscription;
import vn.homecare.identity.repository.WebPushSubscriptionRepository;
import vn.homecare.identity.service.AccountService;
import vn.homecare.identity.service.WebPushSubscriptionService;

@Service
public class WebPushSubscriptionServiceImpl implements WebPushSubscriptionService {

    private final WebPushSubscriptionRepository repository;
    private final AccountService accountService;
    private final LookupHasher hasher;
    private final Clock clock;

    public WebPushSubscriptionServiceImpl(
            WebPushSubscriptionRepository repository, AccountService accountService, LookupHasher hasher, Clock clock) {
        this.repository = repository;
        this.accountService = accountService;
        this.hasher = hasher;
        this.clock = clock;
    }

    @Override
    @Transactional
    public WebPushSubscriptionResponse subscribe(Jwt jwt, WebPushSubscriptionRequest request) {
        Account account = accountService.resolveCurrent(jwt);
        Instant now = Instant.now(clock);
        String endpointHash = hasher.hash(request.endpoint());
        WebPushSubscription subscription = repository
                .findByEndpointHash(endpointHash)
                .map(existing -> {
                    existing.refresh(account.getId(), request.p256dh(), request.auth(), now);
                    return existing;
                })
                .orElseGet(() -> repository.save(new WebPushSubscription(
                        account.getId(), request.endpoint(), endpointHash, request.p256dh(), request.auth(), now)));
        return new WebPushSubscriptionResponse(subscription.getId(), subscription.getCreatedAt());
    }

    @Override
    @Transactional
    public void unsubscribe(Jwt jwt, UUID subscriptionId) {
        Account account = accountService.resolveCurrent(jwt);
        WebPushSubscription subscription = repository
                .findById(subscriptionId)
                .filter(s -> s.getAccountId().equals(account.getId()))
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND, "SUBSCRIPTION_NOT_FOUND", "Không tìm thấy đăng ký thông báo."));
        repository.delete(subscription);
    }
}
