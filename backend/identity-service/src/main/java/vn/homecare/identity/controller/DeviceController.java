package vn.homecare.identity.controller;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.homecare.identity.dto.request.WebPushSubscriptionRequest;
import vn.homecare.identity.dto.response.WebPushSubscriptionResponse;
import vn.homecare.identity.service.WebPushSubscriptionService;

/** API-SV04-008 / 009 (US-01-006). */
@RestController
@RequestMapping("/api/v1/devices/web-push")
public class DeviceController {

    private final WebPushSubscriptionService webPushSubscriptionService;

    public DeviceController(WebPushSubscriptionService webPushSubscriptionService) {
        this.webPushSubscriptionService = webPushSubscriptionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public WebPushSubscriptionResponse subscribe(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody WebPushSubscriptionRequest request) {
        return webPushSubscriptionService.subscribe(jwt, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void unsubscribe(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        webPushSubscriptionService.unsubscribe(jwt, id);
    }
}
