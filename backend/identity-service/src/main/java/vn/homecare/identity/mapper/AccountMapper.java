package vn.homecare.identity.mapper;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.homecare.common.security.PiiMasker;
import vn.homecare.identity.dto.response.AccountResponse;
import vn.homecare.identity.dto.response.AccountSummaryResponse;
import vn.homecare.identity.entity.Account;

/** Account → DTO (R-06). Phone/email are always masked (R-17). */
@Mapper(componentModel = "spring", imports = PiiMasker.class)
public interface AccountMapper {

    @Mapping(target = "phoneMasked", expression = "java(PiiMasker.maskPhone(account.getPhone()))")
    @Mapping(target = "emailMasked", expression = "java(PiiMasker.maskEmail(account.getEmail()))")
    @Mapping(target = "status", expression = "java(account.getStatus().name())")
    AccountSummaryResponse toSummary(Account account, List<String> roles);

    @Mapping(target = "id", source = "account.id")
    @Mapping(target = "createdAt", source = "account.createdAt")
    @Mapping(target = "phoneMasked", expression = "java(PiiMasker.maskPhone(account.getPhone()))")
    @Mapping(target = "emailMasked", expression = "java(PiiMasker.maskEmail(account.getEmail()))")
    @Mapping(target = "status", expression = "java(account.getStatus().name())")
    AccountResponse toResponse(
            Account account,
            List<String> roles,
            UUID partnerOrgId,
            Instant deletionScheduledAt,
            Boolean inviteEmailSent);
}
