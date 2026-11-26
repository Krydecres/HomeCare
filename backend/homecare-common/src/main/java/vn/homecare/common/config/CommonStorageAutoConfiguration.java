package vn.homecare.common.config;

import java.net.URI;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import vn.homecare.common.storage.FileStorageService;
import vn.homecare.common.storage.StorageProperties;

/** {@link FileStorageService} for services that declare {@code homecare.storage.endpoint} (path-style S3). */
@AutoConfiguration
@ConditionalOnClass(S3Client.class)
@ConditionalOnProperty(prefix = "homecare.storage", name = "endpoint")
@EnableConfigurationProperties(StorageProperties.class)
public class CommonStorageAutoConfiguration {

    @Bean
    public FileStorageService fileStorageService(StorageProperties properties) {
        StaticCredentialsProvider credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(properties.accessKeyId(), properties.secretAccessKey()));
        S3Configuration pathStyle =
                S3Configuration.builder().pathStyleAccessEnabled(true).build();
        S3Client client = S3Client.builder()
                .endpointOverride(URI.create(properties.endpoint()))
                .region(Region.of(properties.region()))
                .credentialsProvider(credentials)
                .serviceConfiguration(pathStyle)
                .build();
        S3Presigner presigner = S3Presigner.builder()
                .endpointOverride(URI.create(
                        properties.publicEndpoint() == null ? properties.endpoint() : properties.publicEndpoint()))
                .region(Region.of(properties.region()))
                .credentialsProvider(credentials)
                .serviceConfiguration(pathStyle)
                .build();
        return new FileStorageService(client, presigner);
    }
}
