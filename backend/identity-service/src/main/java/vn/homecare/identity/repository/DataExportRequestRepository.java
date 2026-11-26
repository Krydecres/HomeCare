package vn.homecare.identity.repository;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import vn.homecare.identity.entity.DataExportRequest;
import vn.homecare.identity.entity.DataExportStatus;

public interface DataExportRequestRepository extends JpaRepository<DataExportRequest, UUID> {

    Optional<DataExportRequest> findFirstByAccountIdOrderByCreatedAtDesc(UUID accountId);

    boolean existsByAccountIdAndStatus(UUID accountId, DataExportStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "-2"))
    @Query(
            "select r from DataExportRequest r where r.status = vn.homecare.identity.entity.DataExportStatus.PENDING order by r.createdAt")
    List<DataExportRequest> findPending(Limit limit);

    List<DataExportRequest> findByStatusAndExpiresAtBefore(DataExportStatus status, Instant before);
}
