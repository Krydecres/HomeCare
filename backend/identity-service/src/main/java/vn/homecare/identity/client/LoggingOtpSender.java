package vn.homecare.identity.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import vn.homecare.common.security.PiiMasker;
import vn.homecare.identity.entity.OtpPurpose;

/**
 * DEV/DEMO ONLY (MockSmsSender of 02_Tech_Stack): writes the OTP to the log with the destination masked so testers can
 * read it. Disabled when {@code homecare.otp.log-codes=false} (must be false in production).
 */
public class LoggingOtpSender implements OtpSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingOtpSender.class);

    @Override
    public void send(String destination, String code, OtpPurpose purpose) {
        String masked = destination.contains("@") ? PiiMasker.maskEmail(destination) : PiiMasker.maskPhone(destination);
        log.info("[MOCK OTP] purpose={} to={} code={}", purpose, masked, code);
    }
}
