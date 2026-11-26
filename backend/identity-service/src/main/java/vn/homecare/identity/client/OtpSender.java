package vn.homecare.identity.client;

import vn.homecare.identity.entity.OtpPurpose;

/**
 * Delivers an OTP by SMS or email. 02_Tech_Stack: SMS is a mock adapter until a real provider is plugged in; email
 * goes through notification-service later (OQ-043).
 */
public interface OtpSender {

    void send(String destination, String code, OtpPurpose purpose);
}
