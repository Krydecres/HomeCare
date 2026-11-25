package vn.homecare.caregiver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** caregiver-service (SV06) – see 09_Service_Catalog for what this service owns and must not do. */
@SpringBootApplication
public class CaregiverServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CaregiverServiceApplication.class, args);
    }
}
