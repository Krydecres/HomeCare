# Ghi chú security – GĐ0 (TV1, 24/11/2026)

Các quyết định kỹ thuật cần security lead (TV1) biết khi review PR (R-35).

| # | Ở đâu | Quyết định | Vì sao |
|---|---|---|---|
| S-1 | `homecare-common` `CommonSecurityAutoConfiguration` | Service nghiệp vụ là resource server **stateless**, tắt CSRF | Service chỉ nhận `Authorization: Bearer` từ gateway trong mạng Docker, không dùng cookie → CSRF không áp dụng. CSRF bật ở gateway (BFF). Không copy cấu hình này vào gateway. |
| S-2 | `GatewaySecurityConfig.PAYMENT_CALLBACKS` | Bỏ CSRF chỉ cho `/api/v1/payments/vnpay/ipn`, `/api/v1/payments/momo/ipn` | Callback server-to-server, không có cookie; payment-service phải kiểm tra chữ ký + IP (API-SV11-002/003). |
| S-3 | `GatewaySecurityConfig` | API ẩn danh lấy đúng từ 10_API_Contract (role "Khách vãng lai"); `/internal/**` luôn `denyAll`; còn lại cần đăng nhập | Mặc định từ chối. Thêm API ẩn danh mới → sửa 10 trước rồi sửa danh sách này. |
| S-4 | `IdentityHeaderStripFilter` | Xóa `X-User-*`, `X-Role*`, `X-Forwarded-User` và cả `Authorization` do trình duyệt gửi | Trình duyệt không bao giờ có token (R-08); token chỉ do TokenRelay thêm. |
| S-5 | Keycloak realm | MFA cho ADMIN/ACCOUNTANT/DISPATCHER/PARTNER_ORG qua role kỹ thuật `mfa_required` (composite) | Keycloak "Condition - user role" chỉ nhận 1 role; tránh hỏi OTP 2 lần khi user có 2 role nội bộ. Tên chữ thường nên không thành authority. |
| S-6 | Keycloak realm | Default role chỉ `CUSTOMER`; không có role Account Console → người dùng không tự sửa hồ sơ; `partnerOrgId`, `staffType` chỉ admin sửa; chỉ service account `identity-service` có `manage-users` | US-15-007, OQ-037: role CAREGIVER chỉ do identity-service gán khi bệnh viện duyệt. |
| S-7 | `KeycloakLogoutHandler` | `/logout` gọi back-channel logout của Keycloak bằng refresh token (kết thúc phiên SSO), rồi hủy session Redis, trả 204 | Máy dùng chung (người cao tuổi, nhân viên): lần đăng nhập sau phải nhập lại mật khẩu. |
| S-8 | Gateway | Request API ẩn danh không tạo session (NullRequestCache) | Tránh spam Redis. |
| S-9 | `RateLimitFilter` | Bucket4j + Redis: `/api/**` 120 req/phút theo tài khoản (hoặc IP nếu chưa đăng nhập); OTP, đăng ký, quên mật khẩu 10 req/10 phút theo IP → 429 `RATE_LIMITED` + `Retry-After`. Redis lỗi thì cho qua (fail-open) và ghi log | Chống spam OTP / dò mật khẩu (02_Tech_Stack). Giới hạn đổi bằng `homecare.rate-limit.*`. Giới hạn theo SĐT do identity-service làm thêm (US-01-001). |
| S-10 | `AuditEventRecorder` | Audit đi qua outbox (`audit.recorded`), chỉ chứa ai / hành động / loại + id bản ghi / lý do | Không bao giờ chứa dữ liệu sức khỏe hay thông tin cá nhân (R-17). report-service nhận ở US-13-004. |

## Còn thiếu (chưa làm ở GĐ0)

- WebSocket `/ws`: Spring Cloud Gateway MVC không proxy WebSocket → **OQ-042 (Mở)**, cần TV1 + TV3 chốt.
- Test 403 cho từng endpoint: sẽ có theo từng story; rule ArchUnit đã buộc mọi method `@RestController` có `@PreAuthorize`.
- API ẩn danh ở tầng service: mặc định của `homecare-common` là mọi request phải có JWT, nên `POST /api/v1/otp`,
  `GET /api/v1/services`… hiện nhận 401 từ service dù gateway cho qua. Khi code US-01-001 (identity) và US-04-002 (catalog),
  service đó tự khai báo `SecurityFilterChain` mở đúng các path có role "Khách vãng lai" trong 10_API_Contract
  + `@PreAuthorize("permitAll()")`, PR gắn nhãn `security` để TV1 duyệt.
- Phía nhận audit ở report-service (`AuditEventListener`, NM-0293) là story US-13-004.
