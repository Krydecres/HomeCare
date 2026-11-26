package vn.homecare.identity.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.homecare.identity.dto.request.GrantConsentRequest;
import vn.homecare.identity.dto.response.ConsentResponse;
import vn.homecare.identity.service.ConsentService;

/** API-SV04-015 → 017 (US-14-001). */
@RestController
@RequestMapping("/api/v1/consents")
public class ConsentController {

    private final ConsentService consentService;

    public ConsentController(ConsentService consentService) {
        this.consentService = consentService;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public List<ConsentResponse> listMyConsents(@AuthenticationPrincipal Jwt jwt) {
        return consentService.listMine(jwt);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public ConsentResponse grantConsent(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody GrantConsentRequest request) {
        return consentService.grant(jwt, request);
    }

    @DeleteMapping("/{consentType}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void withdrawConsent(@AuthenticationPrincipal Jwt jwt, @PathVariable String consentType) {
        consentService.withdraw(jwt, consentType);
    }
}
