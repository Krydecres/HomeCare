package vn.homecare.common.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * AES-256-GCM column encryption for sensitive data: health data, ID card numbers, phone/email (NM-0107, R-17, 02_Tech_Stack
 * "Mã hóa dữ liệu").
 *
 * <p>Usage on an entity field: {@code @Convert(converter = EncryptedStringConverter.class)}. Stored format:
 * {@code v1:<base64(iv || ciphertext+tag)>}. The 256-bit key comes from environment variable
 * {@code HOMECARE_ENCRYPTION_KEY} (base64) via property {@code homecare.security.encryption-key}; it is never
 * hard-coded. The bean is registered by {@code CommonSecurityAutoConfiguration} and Hibernate obtains it from the
 * Spring container.
 */
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static final String PREFIX = "v1:";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_BITS = 128;

    private final SecureRandom random = new SecureRandom();
    private final SecretKey key;

    public EncryptedStringConverter(String base64Key) {
        this.key = base64Key == null || base64Key.isBlank() ? null : toKey(base64Key);
    }

    @Override
    public String convertToDatabaseColumn(String plain) {
        if (plain == null) {
            return null;
        }
        try {
            byte[] iv = new byte[IV_LENGTH];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, requireKey(), new GCMParameterSpec(TAG_BITS, iv));
            byte[] encrypted = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            byte[] out = ByteBuffer.allocate(iv.length + encrypted.length)
                    .put(iv)
                    .put(encrypted)
                    .array();
            return PREFIX + Base64.getEncoder().encodeToString(out);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Cannot encrypt column value", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String stored) {
        if (stored == null) {
            return null;
        }
        if (!stored.startsWith(PREFIX)) {
            throw new IllegalStateException("Unknown encrypted column format");
        }
        try {
            byte[] all = Base64.getDecoder().decode(stored.substring(PREFIX.length()));
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, requireKey(), new GCMParameterSpec(TAG_BITS, all, 0, IV_LENGTH));
            byte[] plain = cipher.doFinal(all, IV_LENGTH, all.length - IV_LENGTH);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            throw new IllegalStateException("Cannot decrypt column value", e);
        }
    }

    private SecretKey requireKey() {
        if (key == null) {
            throw new IllegalStateException("homecare.security.encryption-key (HOMECARE_ENCRYPTION_KEY) is not set");
        }
        return key;
    }

    private static SecretKey toKey(String base64Key) {
        byte[] bytes = Base64.getDecoder().decode(base64Key.trim());
        if (bytes.length != 32) {
            throw new IllegalArgumentException("HOMECARE_ENCRYPTION_KEY must be 32 bytes (base64) for AES-256");
        }
        return new SecretKeySpec(bytes, "AES");
    }
}
