package vn.homecare.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Single entry point (SV01) and BFF of the React web: the browser only holds the HttpOnly session cookie and the CSRF
 * cookie; Keycloak tokens stay in the server-side session (Redis) and are relayed to services (R-08).
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
