package vn.homecare.gateway.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * POST /logout (API-SV01-002): ends the user's SSO session at Keycloak (back-channel logout with the refresh token, so
 * the next login asks for the password again – important on shared phones of elders/caregivers), then forgets the
 * authorized client. Spring Security invalidates the Redis session and the cookies afterwards. Still answers 204.
 */
@Component
public class KeycloakLogoutHandler implements LogoutHandler {

    private static final Logger log = LoggerFactory.getLogger(KeycloakLogoutHandler.class);

    private final OAuth2AuthorizedClientRepository authorizedClientRepository;
    private final RestClient restClient;

    public KeycloakLogoutHandler(OAuth2AuthorizedClientRepository authorizedClientRepository) {
        this.authorizedClientRepository = authorizedClientRepository;
        this.restClient = RestClient.create();
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken token)) {
            return;
        }
        OAuth2AuthorizedClient client = authorizedClientRepository.loadAuthorizedClient(
                token.getAuthorizedClientRegistrationId(), authentication, request);
        if (client == null) {
            return;
        }
        OAuth2RefreshToken refreshToken = client.getRefreshToken();
        if (refreshToken != null) {
            endSsoSession(client.getClientRegistration(), refreshToken.getTokenValue());
        }
        authorizedClientRepository.removeAuthorizedClient(
                token.getAuthorizedClientRegistrationId(), authentication, request, response);
    }

    private void endSsoSession(ClientRegistration registration, String refreshToken) {
        String tokenUri = registration.getProviderDetails().getTokenUri();
        String logoutUri = tokenUri.substring(0, tokenUri.lastIndexOf('/')) + "/logout";
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("refresh_token", refreshToken);
        try {
            restClient
                    .post()
                    .uri(logoutUri)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .headers(h -> h.setBasicAuth(registration.getClientId(), registration.getClientSecret()))
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            // Session is still destroyed locally; the refresh token then expires by itself (SSO idle timeout).
            log.warn("Keycloak logout failed: {}", e.getMessage());
        }
    }
}
