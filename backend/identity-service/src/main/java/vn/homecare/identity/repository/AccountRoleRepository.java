package vn.homecare.identity.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.homecare.identity.entity.AccountRole;
import vn.homecare.identity.entity.AppRole;

public interface AccountRoleRepository extends JpaRepository<AccountRole, UUID> {

    List<AccountRole> findByAccountId(UUID accountId);

    List<AccountRole> findByAccountIdAndRevokedAtIsNull(UUID accountId);

    List<AccountRole> findByAccountIdInAndRevokedAtIsNull(Collection<UUID> accountIds);

    Optional<AccountRole> findByAccountIdAndRoleAndRevokedAtIsNull(UUID accountId, AppRole role);

    List<AccountRole> findByRoleAndRevokedAtIsNull(AppRole role);
}
