package vn.homecare.identity.client;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Keycloak CredentialRepresentation for a password. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record KeycloakCredential(String type, String value, Boolean temporary) {

    public static KeycloakCredential password(String value) {
        return new KeycloakCredential("password", value, false);
    }
}
