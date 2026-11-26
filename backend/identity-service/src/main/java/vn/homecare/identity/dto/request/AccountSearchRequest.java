package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import vn.homecare.identity.entity.AccountStatus;
import vn.homecare.identity.entity.AppRole;

/** API-SV04-012 query: q = phone (exact), email or name; page/size per R-19. */
public record AccountSearchRequest(
        @Size(max = 100) String q,
        AppRole role,
        AccountStatus status,
        @Min(0) Integer page,
        @Min(1) @Max(100) Integer size) {

    public int pageOrDefault() {
        return page == null ? 0 : page;
    }

    public int sizeOrDefault() {
        return size == null ? 20 : size;
    }
}
