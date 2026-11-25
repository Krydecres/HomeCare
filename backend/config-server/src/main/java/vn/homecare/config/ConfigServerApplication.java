package vn.homecare.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

/**
 * Centralized configuration (SV03). Dev uses the {@code native} profile on {@code infra/config-repo}; the shared
 * environment points {@code CONFIG_GIT_URI} at the Git repo homecare-config. Never store plain-text secrets there.
 */
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
