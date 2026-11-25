package vn.homecare.common.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.SecureRandom;
import java.util.Base64;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class EncryptedStringConverterTest {

    private static String newKey() {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        return Base64.getEncoder().encodeToString(key);
    }

    @Test
    @DisplayName("TC-US-15-004-1: mã hóa rồi giải mã trả lại đúng chuỗi, bản lưu không chứa chuỗi gốc")
    void roundTrip() {
        EncryptedStringConverter converter = new EncryptedStringConverter(newKey());
        String stored = converter.convertToDatabaseColumn("Dị ứng penicillin");

        assertThat(stored).startsWith("v1:").doesNotContain("penicillin");
        assertThat(converter.convertToEntityAttribute(stored)).isEqualTo("Dị ứng penicillin");
    }

    @Test
    @DisplayName("TC-US-15-004-2: cùng giá trị mã hóa 2 lần ra 2 bản khác nhau (IV ngẫu nhiên)")
    void randomIv() {
        EncryptedStringConverter converter = new EncryptedStringConverter(newKey());
        assertThat(converter.convertToDatabaseColumn("0912345678"))
                .isNotEqualTo(converter.convertToDatabaseColumn("0912345678"));
    }

    @Test
    @DisplayName("TC-US-15-004-3: khóa khác không giải mã được (GCM phát hiện)")
    void wrongKeyFails() {
        String stored = new EncryptedStringConverter(newKey()).convertToDatabaseColumn("secret");
        EncryptedStringConverter other = new EncryptedStringConverter(newKey());
        assertThatThrownBy(() -> other.convertToEntityAttribute(stored)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("TC-US-15-004-4: thiếu khóa thì báo lỗi khi dùng, null giữ nguyên null")
    void missingKey() {
        EncryptedStringConverter converter = new EncryptedStringConverter(null);
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThatThrownBy(() -> converter.convertToDatabaseColumn("x"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("HOMECARE_ENCRYPTION_KEY");
    }

    @Test
    void rejectsShortKey() {
        String shortKey = Base64.getEncoder().encodeToString(new byte[16]);
        assertThatThrownBy(() -> new EncryptedStringConverter(shortKey)).isInstanceOf(IllegalArgumentException.class);
    }
}
