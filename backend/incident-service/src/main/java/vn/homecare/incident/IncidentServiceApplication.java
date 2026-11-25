package vn.homecare.incident;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** incident-service (SV14) – see 09_Service_Catalog for what this service owns and must not do. */
@SpringBootApplication
public class IncidentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IncidentServiceApplication.class, args);
    }
}
