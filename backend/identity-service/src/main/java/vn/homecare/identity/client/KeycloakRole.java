package vn.homecare.identity.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Keycloak RoleRepresentation (realm role). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record KeycloakRole(String id, String name) {}
