package vn.homecare.common.exception;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

class GlobalExceptionHandlerTest {

    record SampleRequest(@NotBlank String name) {}

    @RestController
    static class SampleController {
        @GetMapping("/business")
        String business() {
            throw new BusinessException(HttpStatus.CONFLICT, "BOOKING_SLOT_TAKEN", "Khung giờ đã có người đặt");
        }

        @GetMapping("/denied")
        String denied() {
            throw new AccessDeniedException("nope");
        }

        @GetMapping("/boom")
        String boom() {
            throw new IllegalStateException("db password=123");
        }

        @PostMapping("/validate")
        String validate(@Valid @RequestBody SampleRequest request) {
            return request.name();
        }
    }

    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new SampleController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    @DisplayName("TC-US-15-004-5: BusinessException → ProblemDetail + errorCode")
    void businessError() throws Exception {
        mvc.perform(get("/business"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.errorCode").value("BOOKING_SLOT_TAKEN"))
                .andExpect(jsonPath("$.detail").value("Khung giờ đã có người đặt"));
    }

    @Test
    void accessDeniedIs403() throws Exception {
        mvc.perform(get("/denied"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("TC-US-15-004-6: lỗi không lường trước không lộ thông điệp nội bộ")
    void unexpectedErrorHidesDetails() throws Exception {
        mvc.perform(get("/boom"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.errorCode").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.detail").value("Đã có lỗi xảy ra, vui lòng thử lại"));
    }

    @Test
    void validationErrorListsFields() throws Exception {
        mvc.perform(post("/validate").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fields.name").exists());
    }

    @Test
    @DisplayName("TC-US-15-004-14: lỗi chuẩn của Spring MVC (405) cũng có errorCode (R-19)")
    void springErrorsHaveErrorCode() throws Exception {
        mvc.perform(post("/business"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.errorCode").value("HTTP_405"));
    }
}
