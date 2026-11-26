package vn.homecare.identity.entity;

/** Why an OTP is sent (US-01-001, US-01-003, US-14-002/003 re-authentication). */
public enum OtpPurpose {
    REGISTER,
    RESET_PASSWORD,
    REAUTH
}
