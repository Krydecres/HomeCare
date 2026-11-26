package vn.homecare.identity.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.homecare.identity.entity.LoginSession;

public interface LoginSessionRepository extends JpaRepository<LoginSession, UUID> {

    Optional<LoginSession> findBySessionRefHash(String sessionRefHash);

    List<LoginSession> findByAccountId(UUID accountId);
}
