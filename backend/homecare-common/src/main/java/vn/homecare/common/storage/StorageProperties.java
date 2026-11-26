package vn.homecare.common.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties {@code homecare.storage.*}; secrets only from env (R-17).
 *
 * @param endpoint S3 API reachable from the service, e.g. http://garage:3900
 * @param publicEndpoint S3 API reachable from the browser, used to sign download links, e.g. http://localhost:3900
 * @param region signing region ({@code garage} for Garage)
 * @param accessKeyId env GARAGE_ACCESS_KEY_ID / provider key
 * @param secretAccessKey env GARAGE_SECRET_ACCESS_KEY / provider secret
 */
@ConfigurationProperties("homecare.storage")
public record StorageProperties(
        String endpoint, String publicEndpoint, String region, String accessKeyId, String secretAccessKey) {}
