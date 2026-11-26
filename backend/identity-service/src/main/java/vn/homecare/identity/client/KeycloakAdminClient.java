package vn.homecare.identity.client;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.DeleteExchange;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.PostExchange;
import org.springframework.web.service.annotation.PutExchange;

/**
 * Keycloak Admin REST API of realm {@code homecare} (NM-0217), called with the service account of client
 * {@code identity-service} (the only client allowed to manage users - US-15-007, OQ-037). Base URL
 * {@code <keycloak>/admin/realms/homecare}.
 */
public interface KeycloakAdminClient {

    @PostExchange("/users")
    ResponseEntity<Void> createUser(@RequestBody KeycloakUser user);

    @GetExchange("/users")
    List<KeycloakUser> findUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Boolean exact,
            @RequestParam(required = false) String search,
            @RequestParam int first,
            @RequestParam int max);

    @GetExchange("/users/{id}")
    KeycloakUser getUser(@PathVariable String id);

    @PutExchange("/users/{id}")
    void updateUser(@PathVariable String id, @RequestBody KeycloakUser user);

    @DeleteExchange("/users/{id}")
    void deleteUser(@PathVariable String id);

    @PutExchange("/users/{id}/reset-password")
    void resetPassword(@PathVariable String id, @RequestBody KeycloakCredential credential);

    @PostExchange("/users/{id}/logout")
    void logoutAllSessions(@PathVariable String id);

    @GetExchange("/users/{id}/sessions")
    List<KeycloakSession> getSessions(@PathVariable String id);

    @DeleteExchange("/sessions/{sessionId}")
    void deleteSession(@PathVariable String sessionId);

    @GetExchange("/roles/{name}")
    KeycloakRole getRealmRole(@PathVariable String name);

    @PostExchange("/users/{id}/role-mappings/realm")
    void addRealmRoles(@PathVariable String id, @RequestBody List<KeycloakRole> roles);

    @DeleteExchange("/users/{id}/role-mappings/realm")
    void removeRealmRoles(@PathVariable String id, @RequestBody List<KeycloakRole> roles);

    @PutExchange("/users/{id}/execute-actions-email")
    void executeActionsEmail(@PathVariable String id, @RequestParam int lifespan, @RequestBody List<String> actions);
}
