package vn.homecare.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** API-SV04-008: the PushSubscription of the browser (endpoint + keys). */
public record WebPushSubscriptionRequest(
        @NotBlank @Size(max = 1000) @Pattern(regexp = "https://.+")
        String endpoint,

        @NotBlank @Size(max = 200) String p256dh,
        @NotBlank @Size(max = 100) String auth) {}
