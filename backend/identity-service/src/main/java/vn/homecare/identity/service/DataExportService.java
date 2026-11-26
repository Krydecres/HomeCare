package vn.homecare.identity.service;

import org.springframework.security.oauth2.jwt.Jwt;
import vn.homecare.identity.dto.request.DataExportOtpRequest;
import vn.homecare.identity.dto.response.DataExportResponse;

/** "Xem & tải dữ liệu của tôi" (US-14-002): ZIP built in the background, private link valid 7 days. */
public interface DataExportService {

    /** API-SV04-018: re-authenticated by OTP; one export at a time (EXPORT_IN_PROGRESS). */
    DataExportResponse request(Jwt jwt, DataExportOtpRequest request);

    /** API-SV04-023: latest export of the user, with a fresh download link when READY (null if none). */
    DataExportResponse latest(Jwt jwt);

    /** Job: builds pending exports. Returns how many were built. */
    int buildPending();

    /** Job: marks exports older than their link validity as EXPIRED and deletes the files. */
    int expireOld();
}
