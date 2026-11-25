package vn.homecare.common.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PiiMaskerTest {

    @Test
    void masksPhone() {
        assertThat(PiiMasker.maskPhone("0912 345 678")).isEqualTo("091*****78");
        assertThat(PiiMasker.maskPhone("123")).isEqualTo("***");
        assertThat(PiiMasker.maskPhone(null)).isNull();
    }

    @Test
    void masksEmail() {
        assertThat(PiiMasker.maskEmail("tuan.pham@example.com")).isEqualTo("t***@example.com");
        assertThat(PiiMasker.maskEmail("invalid")).isEqualTo("***");
    }
}
