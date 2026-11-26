package vn.homecare.identity.repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.homecare.identity.entity.Account;
import vn.homecare.identity.entity.AccountStatus;
import vn.homecare.identity.entity.AppRole;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByPhoneHash(String phoneHash);

    Optional<Account> findByEmailHash(String emailHash);

    Optional<Account> findByKeycloakUserId(String keycloakUserId);

    boolean existsByPhoneHash(String phoneHash);

    boolean existsByEmailHash(String emailHash);

    @Query("""
            select a from Account a
            where a.status <> vn.homecare.identity.entity.AccountStatus.DELETED
              and (:status is null or a.status = :status)
              and (:role is null or exists (
                    select r.id from AccountRole r where r.accountId = a.id and r.role = :role and r.revokedAt is null))
            """)
    Page<Account> search(AccountStatus status, AppRole role, Pageable pageable);

    Page<Account> findByKeycloakUserIdIn(Collection<String> keycloakUserIds, Pageable pageable);

    List<Account> findByStatusAndDeletionRequestedAtBefore(AccountStatus status, Instant before);

    @Query("""
            select count(a) from Account a, AccountRole r
            where r.accountId = a.id and r.role = vn.homecare.identity.entity.AppRole.ADMIN
              and r.revokedAt is null and a.status = vn.homecare.identity.entity.AccountStatus.ACTIVE
            """)
    long countActiveAdmins();
}
