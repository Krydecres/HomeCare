package vn.homecare.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Business error thrown by a ServiceImpl. {@link GlobalExceptionHandler} turns it into a ProblemDetail (RFC 9457)
 * with property {@code errorCode} (R-19). The errorCode must be one declared in 10_API_Contract.
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public BusinessException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
