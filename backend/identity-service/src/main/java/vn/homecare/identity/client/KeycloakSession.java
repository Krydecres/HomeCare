package vn.homecare.identity.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Keycloak UserSessionRepresentation: {@code start} / {@code lastAccess} are epoch millis. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record KeycloakSession(String id, String ipAddress, Long start, Long lastAccess) {}
