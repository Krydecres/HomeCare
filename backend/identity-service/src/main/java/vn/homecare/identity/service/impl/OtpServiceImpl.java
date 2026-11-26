package vn.homecare.identity.service.impl;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.regex.Pattern;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import vn.homecare.common.exception.BusinessException;
import vn.homecare.common.security.LookupHasher;
import vn.homecare.common.security.PiiMasker;
import vn.homecare.identity.client.OtpSender;
import vn.homecare.identity.config.IdentityProperties;
import vn.homecare.identity.dto.request.SendOtpRequest;
import vn.homecare.identity.dto.response.OtpSentResponse;
import vn.homecare.identity.entity.Account;
import vn.homecare.identity.entity.OtpPurpose;
import vn.homecare.identity.repository.AccountRepository;
import vn.homecare.identity.service.OtpService;

/**
 * OTP rules (US-01-001, US-01-003): 6 digits, valid 5 minutes, single use; max 5 sends per hour per destination; 5
 * wrong codes lock the destination for 30 minutes. Codes are stored in Redis only as a keyed hash.
 */
@Service
public class OtpServiceImpl implements OtpService {

    static final Pattern VN_MOBILE = Pattern.compile("0[35789][0-9]{8}");
    static final Pattern EMAIL = Pattern.compile("[^@\\s]+@[^@\\s]+\\.[^@\\s]+");
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate redis;
    private final LookupHasher hasher;
    private final OtpSender sender;
    private final AccountRepository accountRepository;
    private final IdentityProperties.Otp rules;

    public OtpServiceImpl(
            StringRedisTemplate redis,
            LookupHasher hasher,
            OtpSender sender,
            AccountRepository accountRepository,
            IdentityProperties properties) {
        this.redis = redis;
        this.hasher = hasher;
        this.sender = sender;
        this.accountRepository = accountRepository;
        this.rules = properties.otp();
    }

    @Override
    public OtpSentResponse send(SendOtpRequest request, String keycloakUserId) {
        String destination = request.purpose() == OtpPurpose.REAUTH
                ? ownDestination(keycloakUserId)
                : OtpService.normalize(request.destination());
        validateFormat(destination);
        String destHash = hasher.hash(destination);
        if (Boolean.TRUE.equals(redis.hasKey(lockKey(destHash)))) {
            throw locked();
        }
        if (request.purpose() == OtpPurpose.REGISTER && existsAccount(destination, destHash)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "PHONE_ALREADY_REGISTERED",
                    "Số điện thoại hoặc email đã có tài khoản. Vui lòng đăng nhập.");
        }
        Long sends = redis.opsForValue().increment(sendsKey(destHash));
        if (sends != null && sends == 1) {
            redis.expire(sendsKey(destHash), Duration.ofHours(1));
        }
        if (sends != null && sends > rules.maxSendsPerHour()) {
            throw new BusinessException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "OTP_RATE_LIMITED",
                    "Bạn đã yêu cầu quá nhiều mã, thử lại sau 1 giờ.");
        }
        // US-01-003: never reveal whether an account exists - unknown destinations get the same answer, no code.
        boolean deliver = request.purpose() != OtpPurpose.RESET_PASSWORD || existsAccount(destination, destHash);
        if (deliver) {
            String code = String.format("%06d", RANDOM.nextInt(1_000_000));
            redis.opsForValue().set(codeKey(request.purpose(), destHash), hasher.hash(code), rules.ttl());
            redis.delete(attemptsKey(request.purpose(), destHash));
            sender.send(destination, code, request.purpose());
        }
        return new OtpSentResponse(mask(destination), rules.ttl().toSeconds());
    }

    @Override
    public void verify(String destination, OtpPurpose purpose, String code) {
        String destHash = hasher.hash(OtpService.normalize(destination));
        if (Boolean.TRUE.equals(redis.hasKey(lockKey(destHash)))) {
            throw locked();
        }
        String expected = redis.opsForValue().get(codeKey(purpose, destHash));
        if (expected != null && expected.equals(hasher.hash(code))) {
            redis.delete(codeKey(purpose, destHash));
            redis.delete(attemptsKey(purpose, destHash));
            return;
        }
        Long attempts = redis.opsForValue().increment(attemptsKey(purpose, destHash));
        redis.expire(attemptsKey(purpose, destHash), rules.lockDuration());
        if (attempts != null && attempts >= rules.maxAttempts()) {
            redis.opsForValue().set(lockKey(destHash), "1", rules.lockDuration());
            redis.delete(codeKey(purpose, destHash));
            throw locked();
        }
        throw new BusinessException(HttpStatus.BAD_REQUEST, "OTP_INVALID", "Mã OTP không đúng hoặc đã hết hạn.");
    }

    private String ownDestination(String keycloakUserId) {
        if (keycloakUserId == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "SESSION_EXPIRED", "Vui lòng đăng nhập lại.");
        }
        Account account = accountRepository
                .findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new BusinessException(HttpStatus.NOT_FOUND, "ACCOUNT_NOT_FOUND", "Không tìm thấy tài khoản."));
        return account.getPhone() != null ? account.getPhone() : account.getEmail();
    }

    private boolean existsAccount(String destination, String destHash) {
        return destination.contains("@")
                ? accountRepository.existsByEmailHash(destHash)
                : accountRepository.existsByPhoneHash(destHash);
    }

    private static void validateFormat(String destination) {
        if (!VN_MOBILE.matcher(destination).matches()
                && !EMAIL.matcher(destination).matches()) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Số điện thoại (10 số) hoặc email không hợp lệ.");
        }
    }

    private static BusinessException locked() {
        return new BusinessException(
                HttpStatus.TOO_MANY_REQUESTS,
                "OTP_LOCKED",
                "Bạn nhập sai quá nhiều lần. Vui lòng thử lại sau 30 phút.");
    }

    private static String mask(String destination) {
        return destination.contains("@") ? PiiMasker.maskEmail(destination) : PiiMasker.maskPhone(destination);
    }

    private static String codeKey(OtpPurpose purpose, String destHash) {
        return "otp:code:" + purpose + ":" + destHash;
    }

    private static String attemptsKey(OtpPurpose purpose, String destHash) {
        return "otp:attempts:" + purpose + ":" + destHash;
    }

    private static String sendsKey(String destHash) {
        return "otp:sends:" + destHash;
    }

    private static String lockKey(String destHash) {
        return "otp:lock:" + destHash;
    }
}
