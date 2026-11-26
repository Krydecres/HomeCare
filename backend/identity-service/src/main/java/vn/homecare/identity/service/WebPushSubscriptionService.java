package vn.homecare.identity.service;

import java.util.UUID;
import org.springframework.security.oauth2.jwt.Jwt;
import vn.homecare.identity.dto.request.WebPushSubscriptionRequest;
import vn.homecare.identity.dto.response.WebPushSubscriptionResponse;

/** Web Push subscriptions of the user's browsers (US-01-006; push itself is sent by notification-service). */
public interface WebPushSubscriptionService {

    /** API-SV04-008: idempotent per browser endpoint. */
    WebPushSubscriptionResponse subscribe(Jwt jwt, WebPushSubscriptionRequest request);

    /** API-SV04-009: only the owner can remove it. */
    void unsubscribe(Jwt jwt, UUID subscriptionId);
}
