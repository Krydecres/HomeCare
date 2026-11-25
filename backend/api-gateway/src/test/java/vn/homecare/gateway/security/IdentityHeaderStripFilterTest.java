package vn.homecare.gateway.security;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class IdentityHeaderStripFilterTest {

    @Test
    @DisplayName("TC-US-15-003-4: header danh tính do client gửi bị xóa trước khi chuyển tiếp (SC-047)")
    void stripsSpoofedIdentityHeaders() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/bookings");
        request.addHeader("X-User-Id", "victim");
        request.addHeader("x-user-roles", "ADMIN");
        request.addHeader("X-Role", "ADMIN");
        request.addHeader("X-Forwarded-User", "admin");
        request.addHeader("Authorization", "Bearer forged");
        request.addHeader("Accept-Language", "vi");
        AtomicReference<HttpServletRequest> forwarded = new AtomicReference<>();

        new IdentityHeaderStripFilter()
                .doFilter(
                        request, new MockHttpServletResponse(), (req, res) -> forwarded.set((HttpServletRequest) req));

        HttpServletRequest seen = forwarded.get();
        assertThat(Collections.list(seen.getHeaderNames())).containsExactly("Accept-Language");
        assertThat(seen.getHeader("X-User-Id")).isNull();
        assertThat(seen.getHeader("authorization")).isNull();
        assertThat(seen.getHeaders("X-Role").hasMoreElements()).isFalse();
        assertThat(seen.getHeader("Accept-Language")).isEqualTo("vi");
    }
}
