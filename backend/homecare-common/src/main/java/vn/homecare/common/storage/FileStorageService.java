package vn.homecare.common.storage;

import java.time.Duration;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * Private S3-compatible storage (NM-0118, 02_Tech_Stack "Lưu file"): Garage in dev, Supabase Storage / R2 for the demo.
 * Objects are never public; the browser only gets short-lived presigned links. Changing provider = changing env vars.
 */
public class FileStorageService {

    private final S3Client s3;
    private final S3Presigner presigner;

    public FileStorageService(S3Client s3, S3Presigner presigner) {
        this.s3 = s3;
        this.presigner = presigner;
    }

    public void put(String bucket, String key, byte[] content, String contentType) {
        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromBytes(content));
    }

    /** Download link for the browser, valid for {@code validity} (presigned with the public endpoint). */
    public String presignedGetUrl(String bucket, String key, Duration validity) {
        return presigner
                .presignGetObject(r -> r.signatureDuration(validity)
                        .getObjectRequest(GetObjectRequest.builder()
                                .bucket(bucket)
                                .key(key)
                                .build()))
                .url()
                .toString();
    }

    public void delete(String bucket, String key) {
        s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }
}
