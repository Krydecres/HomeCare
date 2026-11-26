package vn.homecare.identity.controller;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.homecare.identity.dto.request.SendOtpRequest;
import vn.homecare.identity.dto.response.OtpSentResponse;
import vn.homecare.identity.service.OtpService;

/** API-SV04-001: anonymous (register, reset password) or logged in (REAUTH). Rate-limited at the gateway too. */
@RestController
@RequestMapping("/api/v1/otp")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping
    @PreAuthorize("permitAll()")
    public OtpSentResponse sendOtp(@Valid @RequestBody SendOtpRequest request, @AuthenticationPrincipal Jwt jwt) {
        return otpService.send(request, jwt == null ? null : jwt.getSubject());
    }
}
