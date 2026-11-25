package vn.homecare.carerecord;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** care-record-service (SV10) – see 09_Service_Catalog for what this service owns and must not do. */
@SpringBootApplication
public class CareRecordServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareRecordServiceApplication.class, args);
    }
}
