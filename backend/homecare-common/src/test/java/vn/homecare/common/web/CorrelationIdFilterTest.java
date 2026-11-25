package vn.homecare.common.web;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.HttpServletRequest;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class CorrelationIdFilterTest {

    private final CorrelationIdFilter filter = new CorrelationIdFilter();

    @Test
    @DisplayName("TC-US-15-003-2: không có X-Correlation-Id thì sinh mới, truyền xuống request, response và MDC")
    void generatesWhenMissing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/accounts");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicReference<String> seenHeader = new AtomicReference<>();
        AtomicReference<String> seenMdc = new AtomicReference<>();

        filter.doFilter(request, response, (req, res) -> {
            seenHeader.set(((HttpServletRequest) req).getHeader(CorrelationIdFilter.HEADER));
            seenMdc.set(MDC.get(CorrelationIdFilter.MDC_KEY));
        });

        assertThat(seenHeader.get()).isNotBlank().isEqualTo(seenMdc.get());
        assertThat(response.getHeader(CorrelationIdFilter.HEADER)).isEqualTo(seenHeader.get());
        assertThat(MDC.get(CorrelationIdFilter.MDC_KEY)).isNull();
    }

    @Test
    void keepsValidIncomingValue() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/");
        request.addHeader(CorrelationIdFilter.HEADER, "abc-12345678");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {});

        assertThat(response.getHeader(CorrelationIdFilter.HEADER)).isEqualTo("abc-12345678");
    }

    @Test
    @DisplayName("TC-US-15-003-3: giá trị lạ (có thể chèn log) bị thay bằng id mới")
    void replacesMalformedValue() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/");
        request.addHeader(CorrelationIdFilter.HEADER, "bad\nvalue");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {});

        assertThat(response.getHeader(CorrelationIdFilter.HEADER))
                .doesNotContain("\n")
                .hasSize(36);
    }
}
