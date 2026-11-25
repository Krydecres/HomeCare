package vn.homecare.common.security;

/**
 * Masks personal data before it is written to logs or audit text (R-17: không log dữ liệu cá nhân). Example: {@code
 * maskPhone("0912345678")} returns {@code "091*****78"}.
 */
public final class PiiMasker {

    private PiiMasker() {}

    public static String maskPhone(String phone) {
        if (phone == null) {
            return null;
        }
        String digits = phone.replaceAll("\\s", "");
        if (digits.length() <= 5) {
            return "*".repeat(digits.length());
        }
        return digits.substring(0, 3) + "*".repeat(digits.length() - 5) + digits.substring(digits.length() - 2);
    }

    public static String maskEmail(String email) {
        if (email == null) {
            return null;
        }
        int at = email.indexOf('@');
        if (at <= 0) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}
