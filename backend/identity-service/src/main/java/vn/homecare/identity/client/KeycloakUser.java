package vn.homecare.identity.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;

/** Subset of Keycloak's UserRepresentation used by identity-service. Null fields are not sent (partial update). */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public record KeycloakUser(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        Boolean enabled,
        Boolean emailVerified,
        Map<String, List<String>> attributes,
        List<KeycloakCredential> credentials,
        List<String> requiredActions,
        Long createdTimestamp) {

    /** Full copy for PUT (Keycloak user profile validates the whole representation). */
    public KeycloakUser withAttributes(Map<String, List<String>> newAttributes) {
        return new KeycloakUser(
                id, username, email, firstName, lastName, enabled, emailVerified, newAttributes, null, null, null);
    }

    public KeycloakUser withEnabled(boolean newEnabled) {
        return new KeycloakUser(
                id, username, email, firstName, lastName, newEnabled, emailVerified, attributes, null, null, null);
    }

    public String firstAttribute(String name) {
        if (attributes == null
                || attributes.get(name) == null
                || attributes.get(name).isEmpty()) {
            return null;
        }
        return attributes.get(name).getFirst();
    }
}
