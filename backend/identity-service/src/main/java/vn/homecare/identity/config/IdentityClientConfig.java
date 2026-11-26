package vn.homecare.identity.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.client.OAuth2ClientHttpRequestInterceptor;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;
import vn.homecare.identity.client.KeycloakAdminClient;
import vn.homecare.identity.client.LoggingOtpSender;
import vn.homecare.identity.client.OtpSender;
import vn.homecare.identity.client.PartnerOrgClient;

/**
 * Outgoing calls of identity-service (R-07): Keycloak Admin API with the {@code identity-service} service account
 * (client credentials), and caregiver-service through Eureka with the same service-account token.
 */
@Configuration
@EnableConfigurationProperties(IdentityProperties.class)
public class IdentityClientConfig {

    static final String REGISTRATION_ID = "identity-service";

    @Bean
    public AuthorizedClientServiceOAuth2AuthorizedClientManager serviceAccountClientManager(
            ClientRegistrationRepository registrations, OAuth2AuthorizedClientService authorizedClients) {
        var manager = new AuthorizedClientServiceOAuth2AuthorizedClientManager(registrations, authorizedClients);
        manager.setAuthorizedClientProvider(OAuth2AuthorizedClientProviderBuilder.builder()
                .clientCredentials()
                .build());
        return manager;
    }

    /** Always uses the service account, never the end user's token. */
    private static OAuth2ClientHttpRequestInterceptor serviceAccountInterceptor(
            AuthorizedClientServiceOAuth2AuthorizedClientManager manager) {
        OAuth2ClientHttpRequestInterceptor interceptor = new OAuth2ClientHttpRequestInterceptor(manager);
        interceptor.setClientRegistrationIdResolver(request -> REGISTRATION_ID);
        interceptor.setPrincipalResolver(request -> new AnonymousAuthenticationToken(
                REGISTRATION_ID, REGISTRATION_ID, AuthorityUtils.createAuthorityList("ROLE_SYSTEM")));
        return interceptor;
    }

    @Bean
    public KeycloakAdminClient keycloakAdminClient(
            IdentityProperties properties, AuthorizedClientServiceOAuth2AuthorizedClientManager manager) {
        RestClient restClient = RestClient.builder()
                .baseUrl(properties.keycloakAdminUrl())
                .requestInterceptor(serviceAccountInterceptor(manager))
                .build();
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient))
                .build()
                .createClient(KeycloakAdminClient.class);
    }

    @Bean
    @LoadBalanced
    public RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    public PartnerOrgClient partnerOrgClient(
            RestClient.Builder loadBalancedRestClientBuilder,
            AuthorizedClientServiceOAuth2AuthorizedClientManager manager) {
        RestClient restClient = loadBalancedRestClientBuilder
                .clone()
                .baseUrl("http://caregiver-service")
                .requestInterceptor(serviceAccountInterceptor(manager))
                .build();
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient))
                .build()
                .createClient(PartnerOrgClient.class);
    }

    @Bean
    public OtpSender otpSender(IdentityProperties properties) {
        if (!properties.otp().logCodes()) {
            throw new IllegalStateException("No real SMS/email OTP provider configured (OQ-043); "
                    + "set homecare.identity.otp.log-codes=true only in dev/demo");
        }
        return new LoggingOtpSender();
    }
}
