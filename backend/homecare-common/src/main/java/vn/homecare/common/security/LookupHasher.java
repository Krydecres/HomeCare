package vn.homecare.common.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Keyed hash (HMAC-SHA256, hex) for columns that must be searchable but are stored encrypted, e.g. {@code phone_hash},
 * {@code email_hash} (DD-0010, DD-0011), and for IP addresses in audit/session rows (DD-0021, DD-0138). The key comes
 * from env {@code HOMECARE_LOOKUP_HASH_KEY}; without the key the hash cannot be reversed by brute force.
 */
public class LookupHasher {

    private static final String ALGORITHM = "HmacSHA256";
    private final SecretKeySpec key;

    public LookupHasher(String base64Key) {
        this.key = base64Key == null || base64Key.isBlank()
                ? null
                : new SecretKeySpec(Base64.getDecoder().decode(base64Key.trim()), ALGORITHM);
    }

    /** Lower-cases and trims before hashing so "A@b.vn " and "a@b.vn" match. */
    public String hash(String value) {
        if (value == null) {
            return null;
        }
        if (key == null) {
            throw new IllegalStateException("homecare.security.lookup-hash-key (HOMECARE_LOOKUP_HASH_KEY) is not set");
        }
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(key);
            byte[] digest = mac.doFinal(value.trim().toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Cannot hash lookup value", e);
        }
    }
}
