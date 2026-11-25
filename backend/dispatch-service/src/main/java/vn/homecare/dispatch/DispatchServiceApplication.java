package vn.homecare.dispatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** dispatch-service (SV09) – see 09_Service_Catalog for what this service owns and must not do. */
@SpringBootApplication
public class DispatchServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DispatchServiceApplication.class, args);
    }
}
