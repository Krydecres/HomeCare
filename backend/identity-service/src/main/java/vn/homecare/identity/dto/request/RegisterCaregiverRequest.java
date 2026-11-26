package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;
import vn.homecare.identity.entity.StaffType;

/**
 * API-SV04-004 (US-01-004). No role/status field: the server adds CAREGIVER_PENDING itself. {@code workplaceNote} =
 * khoa/vi tri (nhan vien y te) or noi muon danh gia (nguoi cham soc), forwarded to caregiver-service.
 */
public record RegisterCaregiverRequest(
        @NotNull StaffType staffType,
        @NotNull UUID partnerOrgId,
        @Size(max = 200) String workplaceNote,
        @NotNull LocalDate dateOfBirth,
        @NotBlank String acceptedCaregiverCodeVersion,
        @NotBlank String acceptedPartnerSharingVersion) {}
