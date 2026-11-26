package vn.homecare.identity.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.homecare.identity.entity.WebPushSubscription;

public interface WebPushSubscriptionRepository extends JpaRepository<WebPushSubscription, UUID> {

    Optional<WebPushSubscription> findByEndpointHash(String endpointHash);

    List<WebPushSubscription> findByAccountId(UUID accountId);
}
