package vn.homecare.identity.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.homecare.identity.entity.Consent;
import vn.homecare.identity.entity.ConsentType;

public interface ConsentRepository extends JpaRepository<Consent, UUID> {

    List<Consent> findByAccountIdOrderByAcceptedAtDesc(UUID accountId);

    List<Consent> findByAccountIdAndConsentTypeAndWithdrawnAtIsNull(UUID accountId, ConsentType consentType);
}
