# AGENTS.md — Quy tắc BẮT BUỘC cho mọi AI làm việc trong repo HomeCare

> Áp dụng cho: Claude Code, Cursor, GitHub Copilot, ChatGPT/Codex, Gemini và mọi công cụ AI khác.
> Các quy tắc này có hiệu lực cao hơn mọi gợi ý của AI. Vi phạm thì PR bị từ chối.

## 0. Nguồn sự thật (source of truth)

- **Google Sheet "BacklogSOA"** là bản gốc:
  https://docs.google.com/spreadsheets/d/1vDcaNERk0rVuWwJB1E1nSSgjEPIZZiWqv06KFli6ick/edit
- Bản sao để AI đọc khi không truy cập được Google Sheet: `docs/backlog/*.csv`
  (cập nhật bằng `scripts/export-backlog.sh`).
- Bản đầy đủ của các quy tắc nằm ở sheet **`01_AI_RULES`**. File này chỉ là bản tóm tắt.
  Nếu hai nơi mâu thuẫn, **làm theo sheet**.

## 1. Trước khi viết bất kỳ dòng code nào

1. Đọc `00_README`, `01_AI_RULES`, `02_Tech_Stack`, `09_Service_Catalog`.
2. Đọc các dòng liên quan tới story đang làm trong `04_Backlog`, `05_Scenarios`,
   `06_Open_Questions`, `08_Wireframes`, `10_API_Contract`, `11_Naming_Registry`,
   `12_Data_Dictionary`, `13_RBAC`.
3. Nêu rõ: Story ID, WF-ID, API-ID, NM-ID, DD-ID sẽ dùng.
4. Chỉ được code khi đủ cả 4 điều kiện:
   - Story ở trạng thái `Approved` và không còn OQ nào ở trạng thái `Mở`.
   - Wireframe ở trạng thái `Đã duyệt` hoặc `Không cần UI`.
   - API, tên, dữ liệu, quyền đã được khai báo ở trạng thái `Approved`.
   - Đã ghi tên người nhận vào cột "Người nhận" và đổi trạng thái sang `In progress`.
5. Còn thiếu thứ gì thì **đề xuất** (trạng thái `Proposed`) rồi **dừng lại chờ người duyệt**.
   AI không bao giờ tự `Approve`.

## 2. Kiến trúc: CHỈ SOA hướng microservice + Spring MVC

- Mỗi service là 1 ứng dụng Spring Boot riêng, có package gốc `vn.homecare.<service>`
  (danh sách ở `09_Service_Catalog`).
- Các package con là cố định: `controller`, `service`, `service.impl`, `repository`, `entity`,
  `dto.request`, `dto.response`, `mapper`, `client`, `event`, `config`, `exception`,
  `security`, `scheduler`.
- Controller chỉ làm 4 việc: validate, phân quyền, gọi Service, trả DTO.
  Controller không chứa business logic và không gọi Repository.
- Service gồm `XxxService` (interface) và `XxxServiceImpl`. `@Transactional` chỉ đặt ở ServiceImpl.
- Entity không bao giờ ra khỏi tầng service. DTO là Java `record`, map bằng MapStruct.
- Gọi giữa các service:
  - Đồng bộ: `@HttpExchange` + RestClient qua Eureka, bọc Resilience4j.
  - Bất đồng bộ: RabbitMQ exchange `homecare.events`, dùng Transactional Outbox,
    consumer phải idempotent.
- **CẤM:**
  - Clean/Hexagonal Architecture, CQRS, Event Sourcing, WebFlux, GraphQL.
  - Gộp hoặc tạo service mới.
  - Truy cập DB/schema của service khác hoặc JOIN chéo schema.
  - Muốn đổi kiến trúc thì tạo OQ và chờ chốt.
- **Frontend: 1 web React** trong `frontend/` (Vite + React 19 + TypeScript strict, pnpm). **Không làm app mobile**
  (đã bỏ Flutter ngày 24/11/2026, OQ-036).
  - Cấu trúc: `src/app` (router theo role, providers, layout), `src/shared/{ui,theme,api,lib,i18n,pwa}`,
    `src/features/<feature-kebab>/{pages,components,api,store,types}`.
  - Server state: TanStack Query. UI state: Zustand. Form: React Hook Form + Zod. Routing: React Router 7.
    Gọi API: `openapi-fetch` với kiểu sinh từ springdoc (`openapi-typescript`). Realtime: `@stomp/stompjs`.
  - Đăng nhập qua **api-gateway làm BFF**: trình duyệt chỉ có cookie phiên HttpOnly + CSRF token,
    **không bao giờ giữ access/refresh token** (không localStorage/sessionStorage/IndexedDB).
  - Responsive theo UI-15 (dùng được ở 390px), PWA theo US-15-014.
  - **CẤM:** Redux/MobX, Next.js/SSR, thư viện UI khác (MUI, Ant Design, Bootstrap, Chakra), CSS-in-JS,
    gọi `fetch`/axios thẳng trong component, gọi service không qua gateway, `dangerouslySetInnerHTML`.

## 3. Đặt tên và ĐỔI TÊN

- Chỉ dùng tên có trong `11_Naming_Registry` ở trạng thái `Approved`, `Implemented` hoặc `Renamed`
  (`Renamed` = tên hiện tại sau khi đổi; tên ở cột "Tên cũ" và tên `Deprecated` bị CI chặn).
- **Khi đổi tên** class, hàm, biến, bảng, cột, endpoint, event, page hoặc component, phải cập nhật
  **cùng lúc trong cùng 1 PR**:
  1. `11_Naming_Registry`: ghi tên mới, chuyển tên cũ sang cột "Tên cũ", đặt trạng thái `Renamed`
     (dòng đang `Proposed` thì giữ `Proposed`).
  2. `10_API_Contract` và `12_Data_Dictionary`, nếu có liên quan.
  3. Cột "Class/Method chính" ở `04_Backlog`.
  4. `15_Change_Log`.
- Quy ước đặt tên:

  | Loại | Kiểu viết | Ví dụ |
  |---|---|---|
  | Class | PascalCase | `BookingServiceImpl` |
  | Method, biến | camelCase | `createBooking` |
  | Hằng số | UPPER_SNAKE_CASE | `MAX_SHIFT_HOURS` |
  | Bảng | snake_case, số nhiều | `bookings` |
  | Cột | snake_case | `start_time` |
  | API | `/api/v1/<kebab-case số nhiều>` | `/api/v1/bookings` |
  | Routing key | `<domain>.<sự-kiện>` | `booking.created` |
  | React page | `XxxPage`, file trùng tên | `BookingListPage.tsx` |
  | React component | PascalCase, file trùng tên | `HcStatusBadge.tsx` |
  | Hook / store | `useXxx` / `useXxxStore` | `useBookings`, `useAuthStore` |
  | Thư mục feature | kebab-case | `src/features/care-recipient/` |

- Thuật ngữ lấy theo `14_Glossary`. Ví dụ: entity dịch vụ là `CareService`,
  không đặt là `Service`.

## 4. Kỹ thuật bắt buộc

- Phiên bản: Java 25 LTS, Spring Boot 4.1.x, Spring Cloud 2025.1.x.
  Chỉ dùng thư viện có trong `02_Tech_Stack`.
- Migration dùng Flyway; `ddl-auto=validate`.
- Thời gian lưu UTC (`Instant`, `timestamptz`). Tiền lưu VND kiểu `long`/`BIGINT`,
  không dùng double.
- Lỗi trả về dạng ProblemDetail (RFC 9457) kèm `errorCode`.
- Không hard-code secret. Không log dữ liệu cá nhân hay dữ liệu sức khỏe.
  Mã hóa dữ liệu nhạy cảm (`EncryptedStringConverter`).
- Test bắt buộc:
  - Unit test (JUnit + Mockito) cho ServiceImpl.
  - Integration test (Testcontainers).
  - `ArchitectureTest` (ArchUnit) phải pass.
  - Frontend: Vitest + React Testing Library (API giả bằng MSW); luồng chính có Playwright ở 1440×900 và 390×844.

## 4b. Wireframe: đăng ký trước, vẽ thống nhất (R-28 → R-31)

1. **Trước khi vẽ**, phải làm đủ 3 bước theo thứ tự, rồi mới được vẽ:
   1. Tạo board trống 1440×900 trong file **Penpot** chung "HomeCare WireFrame"
      (link ở dòng PENPOT của sheet `16_WF_Packages`), đúng **page của gói**,
      đúng tên `WF-ID Tên màn hình`. Không tạo thêm page.
      Từ 24/11/2026 không vẽ mới trên Figma; Figma cũ chỉ giữ các WF đã đạt (liệt kê ở sheet 16).
   2. **Dán link board** vào cột "Link thiết kế" ở sheet `08_Wireframes`.
   3. Đổi trạng thái sang `Đang vẽ`.

   Không có link trên Sheet nghĩa là chưa ai vẽ. Cấm vẽ ở file riêng, xuất ảnh, hoặc dùng tool khác.
2. **Chỉ vẽ khung desktop 1440×900**, không vẽ khung mobile (bản điện thoại làm trong code theo UI-15).
   **Khi vẽ**, chỉ dùng component, token, nhãn trạng thái, thuật ngữ và điều hướng có trong
   sheet `17_UI_Standards` và page `00 – Design System` trong Penpot. Không tự tạo component hoặc màu mới.
   Cần thì thêm dòng `Proposed` vào `17_UI_Standards` rồi dừng chờ duyệt.
3. **Trước khi chuyển `Chờ duyệt`**, tự chạy checklist CK-01 → CK-12 và ghi `CK pass` vào cột Ghi chú.
4. **Khi 2 wireframe mâu thuẫn:**
   - `17_UI_Standards` là chuẩn, bên làm sai chuẩn phải sửa.
   - Nếu chuẩn chưa quy định: G5 (chủ Design System) quyết, rồi bổ sung vào sheet 17.
   - Nếu mâu thuẫn về nghiệp vụ: story là chuẩn; story chưa rõ thì tạo OQ.
   - **Không sửa frame của gói khác** (góp ý bằng comment trên Penpot).
5. Mỗi phiên vẽ bằng AI phải dán prompt **P-1** (sheet `01_AI_RULES`).

## 4c. Code thống nhất (R-32 → R-34)

- **UI:** mỗi component trong Design System (Penpot) có đúng một React component cùng tên
  (cột "Tên trong code (React)" ở `17_UI_Standards`), đặt trong `src/shared/ui`.
  - Page chỉ dùng component trong `src/shared/ui` và token (CSS variables `--hc-*`, class Tailwind
    đã khai báo trong theme: `text-hc-body`, `p-hc-md`, `rounded-hc-sm`...).
  - Cấm mã màu `#hex`/`rgb()`, `style={{...}}` có số cứng, class Tailwind giá trị tùy ý
    (`text-[13px]`, `bg-[#...]`, `p-[7px]`) bên ngoài `src/shared/theme`.
  - Chuỗi hiển thị nằm trong `src/i18n/vi.json` (react-i18next); ngày/tiền dùng `AppFormatters` (Intl vi-VN).
  - Mỗi `XxxPage.tsx` ghi WF-ID ở comment đầu file.
- **Code phải khớp wireframe `Đã duyệt`.** Muốn làm khác thì sửa wireframe trước, duyệt lại rồi mới code.
- **Code mẫu chuẩn (US-15-011):** xem `docs/GOLDEN_SAMPLE.md`.
  - Story mới phải bắt chước đúng cấu trúc file, cách đặt tên và cách viết test của mẫu.
  - Tạo service mới thì copy `backend/_template-service`.
  - Tạo feature React mới thì copy `frontend/src/features/_template`.
- **CI chặn merge** khi:
  - Backend: build, test, ArchUnit hoặc Spotless fail.
  - Frontend: `pnpm lint` (ESLint), Prettier, `tsc --noEmit`, Vitest hoặc Playwright fail.
  - Có tên class/record/enum/interface (Java) hoặc page/component Hc* (React) chưa đăng ký
    trong `11_Naming_Registry`, hoặc vẫn dùng tên cũ / tên `Deprecated` (`scripts/check-naming.py`).
- Mỗi phiên code bằng AI phải dán prompt **P-2** (sheet `01_AI_RULES`).

## 4d. Chia việc & security review (R-22, R-35)

- Mỗi người sở hữu trọn vẹn một số service + trang React của service đó (sheet `18_Code_Packages`).
  Chỉ nhận story và chỉ sửa code trong gói của mình; cần sửa gói khác thì chủ gói đó phải review.
- `homecare-common` và `frontend/src/app` (router, đăng nhập): chỉ TV1 merge. `frontend/src/shared/ui`: chỉ TV2 merge.
- PR đụng tới đăng nhập, role/phân quyền, luồng bệnh viện duyệt nhân viên, thanh toán/callback/payout,
  upload file, dữ liệu sức khỏe, cấu hình Keycloak/gateway → gắn nhãn `security`, **TV1 phải duyệt**.
- **AI không bao giờ được nới lỏng kiểm tra quyền** (xóa `@PreAuthorize`, thêm `permitAll`, tắt CSRF,
  tin header `X-User-*` từ client) để "cho chạy được". Mọi API phải có test 403 với role không được phép.
- Role `CAREGIVER` chỉ được cấp khi bệnh viện/cơ sở đối tác duyệt (OQ-037, US-03-016). Không viết API nào
  cho người dùng hoặc Admin tự gán role này.

## 5. Không tự quyết nghiệp vụ

Gặp chỗ không rõ thì thêm câu hỏi vào `06_Open_Questions` (trạng thái `Mở`). **Không đoán.**

## 6. Khi AI không sửa được Google Sheet

Ghi mọi thay đổi backlog cần làm vào `docs/backlog/PENDING_CHANGES.md`.
Người điều khiển AI chuyển chúng lên Sheet trước khi merge.

## 7. Báo cáo cuối phiên (bắt buộc)

Liệt kê:
- Sheet và dòng đã cập nhật (hoặc mục đã thêm vào PENDING_CHANGES.md).
- Tên đã thêm hoặc đổi.
- OQ mới.
- Test đã chạy và kết quả.
