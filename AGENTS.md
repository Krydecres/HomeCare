# AGENTS.md — Quy tắc cho mọi AI làm việc trong repo HomeCare

> Áp dụng cho: Claude Code, Cursor, GitHub Copilot, ChatGPT/Codex, Gemini và mọi công cụ AI khác.
> Các quy tắc này có hiệu lực cao hơn mọi gợi ý của AI.
>
> **Nguyên tắc (bản nới 26/11/2026): tự chủ trong gói, CI giữ kỷ luật.** Luật chia 3 tầng (cột "Tầng" ở `01_AI_RULES`):
> - **A – Cứng:** kiến trúc, bảo mật, test, tên đã đăng ký. CI tự chặn, không cần người duyệt.
> - **B – Tự quyết:** người code tự làm, tự ghi lại sheet, **không chờ ai duyệt**.
> - **C – Báo trước:** báo chủ liên quan, quá **24h** (security lõi **48h**) không phản hồi thì cứ làm (R-36).
>
> Không quy tắc nào bắt một người phải chờ người khác vô thời hạn.

## 0. Nguồn sự thật (source of truth)

- **Google Sheet "BacklogSOA"** là bản gốc:
  https://docs.google.com/spreadsheets/d/1vDcaNERk0rVuWwJB1E1nSSgjEPIZZiWqv06KFli6ick/edit
- Bản sao để AI đọc khi không truy cập được Google Sheet: `docs/backlog/*.csv`
  (cập nhật bằng `scripts/export-backlog.sh`).
- Bản đầy đủ của các quy tắc nằm ở sheet **`01_AI_RULES`**. File này chỉ là bản tóm tắt.
  Nếu hai nơi mâu thuẫn, **làm theo sheet**.

## 1. Trước khi viết bất kỳ dòng code nào

1. Đọc `01_AI_RULES`, `09_Service_Catalog` và các dòng của story đang làm trong `04_Backlog`
   (kèm API / tên / bảng / quyền liên quan ở `10`, `11`, `12`, `13`). Sheet khác đọc khi cần.
2. Nêu rõ: Story ID, WF-ID, API-ID, NM-ID, DD-ID sẽ dùng lại hoặc sẽ thêm mới.
3. Nhận story: ghi mã TV vào cột "Người nhận" + "Ngày nhận", đổi `In progress`.
   Chủ gói **tự chuyển** story của gói mình sang `Approved` khi AC đã rõ.
4. **Tên, API, bảng/cột, quyền không cần ai duyệt** (R-10, R-14):
   - **Tìm** trong `11_Naming_Registry` / `10_API_Contract` / `12_Data_Dictionary` / `13_RBAC`
     (và trong code). Đã có thứ cùng nghĩa thì **dùng lại đúng tên đó**.
   - Chưa có thì **tự thêm dòng mới** (trạng thái `Approved`, ghi người thêm) rồi dùng ngay,
     trong **cùng PR** với code. Người và AI đều làm vậy.
   - Hai người lỡ thêm 2 tên cùng nghĩa thì người thêm sau đổi theo tên có trước (R-11).
5. Wireframe: 64/64 WF đã `Đã duyệt`, code được ngay (R-13). Backend và story `Không cần UI` không phụ thuộc WF.
6. Phụ thuộc gói khác chưa xong thì **không chờ**: viết client theo `10_API_Contract` rồi giả lập
   (WireMock/Testcontainers ở backend, MSW ở frontend). Chưa có hợp đồng thì tự thêm dòng vào `10`.
7. **Chỉ dừng hỏi người điều khiển** khi đụng việc tầng C (R-36) hoặc security lõi (R-35), xem mục 4d.

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

- Tên phải **có trong `11_Naming_Registry`**: tìm trước, có thì dùng lại, chưa có thì tự thêm (mục 1.4).
  CI chấp nhận mọi trạng thái trừ `Deprecated`; tên ở cột "Tên cũ" và tên `Deprecated` bị CI chặn.
- **Khi đổi tên** class, hàm, biến, bảng, cột, endpoint, event, page hoặc component, trong **cùng 1 PR** phải cập nhật:
  1. `11_Naming_Registry`: ghi tên mới, chuyển tên cũ sang cột "Tên cũ", đặt trạng thái `Renamed`.
  2. `15_Change_Log`.
  3. `10_API_Contract`, nếu đổi endpoint/event mà gói khác đang dùng (báo chủ gói đó theo R-36).

  Cột "Class/Method chính" ở `04_Backlog` và `12_Data_Dictionary` được cập nhật bù trong vòng 2 ngày.
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
  Dùng thư viện trong `02_Tech_Stack`. Thư viện không nằm trong danh sách CẤM và không trùng chức năng
  thư viện đã có thì được tự thêm, ghi vào `02_Tech_Stack` + `15_Change_Log` (R-16).
  Thay thư viện lõi (Spring, React, TanStack Query, Zustand, Tailwind, Keycloak, RabbitMQ...) thì tạo OQ.
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
   Cần thì thêm dòng `Proposed` vào `17_UI_Standards` và báo G5 (R-29; chỉ áp dụng cho WF mới).
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
  - Thiếu component thì **tự thêm** component mới vào `src/shared/ui` (thêm dòng ở `17` + `11`) và tự merge.
    Sửa hoặc xóa component đang được dùng thì theo R-36 (chủ: TV2).
- **Code khớp wireframe `Đã duyệt`** (R-13). Lệch nhỏ (bố cục, thứ tự, khoảng cách theo token) thì cứ làm,
  dán ảnh so sánh vào PR. Đổi luồng hoặc dữ liệu hiển thị thì chủ gói tự sửa WF của gói mình.
- **Code mẫu chuẩn (US-15-011, `docs/GOLDEN_SAMPLE.md`) là mẫu tham khảo, không phải cổng chặn** (R-33).
  - Tạo service mới thì copy `backend/_template-service`.
  - Tạo feature React mới thì copy `frontend/src/features/_template`.
  - Khi US-15-011 Done, mỗi chủ gói chỉnh code đã viết theo mẫu trong 1 PR "align" (trong vòng 1 tuần).
- **CI xanh thì tác giả tự merge**, không cần reviewer (trừ security lõi và việc tầng C).
  Review chéo chuyển thành hậu kiểm hàng tuần (sheet 18, cột J).
- **CI chặn merge** khi:
  - Backend: build, test, ArchUnit hoặc Spotless fail.
  - Frontend: `pnpm lint` (ESLint), Prettier, `tsc --noEmit`, Vitest hoặc Playwright fail.
  - Có tên class/record/enum/interface (Java) hoặc page/component Hc* (React) chưa đăng ký
    trong `11_Naming_Registry`, hoặc vẫn dùng tên cũ / tên `Deprecated` (`scripts/check-naming.py`).
- Mỗi phiên code bằng AI phải dán prompt **P-2** (sheet `01_AI_RULES`).

## 4d. Chia việc, việc phải báo, security (R-22, R-35, R-36)

- Mỗi người sở hữu trọn vẹn một số service + trang React của service đó (sheet `18_Code_Packages`)
  và chỉ nhận story trong gói của mình.
- **Việc phải báo trước (tầng C, R-36):**
  1. Đổi/xóa API Internal hoặc event mà gói khác đang dùng.
  2. **Sửa/xóa** (không phải thêm mới) code trong `homecare-common` (chủ TV1), `frontend/src/shared/ui` (chủ TV2),
     `frontend/src/app` (chủ TV1).
  3. Sửa code trong service/feature của gói khác.
  4. OQ nghiệp vụ chéo gói.

  Cách làm: mở PR/OQ, tag chủ liên quan, ghi rõ hạn. Quá 24h không phản hồi là đồng ý, tác giả merge.
  Chủ không đồng ý thì 2 bên chốt trong 24h tiếp; không chốt được thì TV1 (chủ dự án) quyết.
  **Thêm mới** vào code dùng chung (class, util, component, API mới) thì tự merge, không cần báo.
- **Security chia 2 mức:**
  - **Lõi:** cấu hình Keycloak/realm, api-gateway (BFF, CSRF, CSP, route), `frontend/src/app` (đăng nhập, chặn route),
    callback thanh toán/payout/hoàn tiền, luồng bệnh viện duyệt và cấp role CAREGIVER. Gắn nhãn `security`, TV1 review;
    quá 48h không phản hồi thì tác giả merge, TV1 hậu kiểm.
  - **Thường:** upload file/ảnh, dữ liệu sức khỏe, `@PreAuthorize` của API mới. Tự merge khi có test 403 cho role
    không được phép và CodeQL pass; gắn nhãn `security` để TV1 hậu kiểm.
- **AI không bao giờ được nới lỏng kiểm tra quyền** (xóa `@PreAuthorize`, thêm `permitAll`, tắt CSRF,
  tin header `X-User-*` từ client) để "cho chạy được". Mọi API phải có test 403 với role không được phép.
- Role `CAREGIVER` chỉ được cấp khi bệnh viện/cơ sở đối tác duyệt (OQ-037, US-03-016). Không viết API nào
  cho người dùng hoặc Admin tự gán role này.

## 4e. Code hết gói một mạch, thiếu thì khai báo tượng trưng (R-37)

Mỗi người nhận **toàn bộ story của gói mình** (cột "Người nhận" ở `04_Backlog`) và code liền một mạch, không chờ gói khác.
Cần thứ của gói khác mà chưa có thì **khai báo tượng trưng theo hợp đồng**, dùng **đúng tên thật** trong `09` / `10` / `11`
(tìm trước, chưa có thì thêm theo R-10; tự đặt tên khác thì lúc ghép sẽ hỏng):

1. **Gọi API gói khác:** tự viết trong service *của mình* interface client + record DTO, đúng path và tên:

   ```java
   // booking-service (TV5) – vn.homecare.booking.client.CatalogPricingClient
   @HttpExchange("/internal/v1/pricing")              // path đúng 10_API_Contract
   public interface CatalogPricingClient {
       @PostExchange("/quotes")
       QuoteView quote(@RequestBody QuoteQuery query); // tên đúng 11_Naming_Registry
   }
   ```

   - Test: giả lập bằng Mockito hoặc WireMock.
   - Chạy trên máy khi gói kia chưa có: lớp `StubCatalogPricingClient implements CatalogPricingClient`, chỉ bật với
     `@Profile("stub")` (không bao giờ bật ở profile mặc định).
   - Web: giả lập API chưa có bằng handler MSW.
2. **Chờ event gói khác:** tự khai báo record payload đúng routing key ở `09`; test tự bắn event giả.
3. **Thiếu code dùng chung** (`homecare-common`, `frontend/src/shared/ui`): tạo file đúng tên đã đăng ký (`11` / `17`),
   phần ruột tối thiểu, ghi `// TODO(stub): TVx hoàn thiện`.

Khi gói kia cài đặt xong: với (1) và (2) **chỉ tắt stub, không phải merge code**, vì hai service khớp nhau qua path + JSON
lúc chạy; với (3), nếu Git báo trùng file thì giữ bản cài đặt thật. Không copy class của service khác sang,
không truy cập DB của service khác (R-07).

## 5. Không tự quyết nghiệp vụ

AI không đoán nghiệp vụ. Gặp chỗ không rõ (R-15):
- Nghiệp vụ chỉ nằm trong gói: hỏi người điều khiển (chủ gói). Chủ gói tự chốt, ghi vào `06_Open_Questions`
  trạng thái `Đã chốt` ("chủ gói TVx chốt").
- Nghiệp vụ chéo gói: tạo OQ `Mở` kèm phương án đề xuất, tag chủ gói liên quan. Quá 24h không ai phản đối
  thì chốt theo phương án đó. Story không phải dừng chờ.

## 6. Khi AI không sửa được Google Sheet

Ghi mọi thay đổi backlog cần làm vào `docs/backlog/PENDING_CHANGES.md`.
Được merge trước; người điều khiển AI chuyển chúng lên Sheet trong ngày (R-25).

## 7. Báo cáo cuối phiên (bắt buộc)

Liệt kê:
- Sheet và dòng đã cập nhật (hoặc mục đã thêm vào PENDING_CHANGES.md).
- Tên đã thêm hoặc đổi.
- OQ mới.
- Test đã chạy và kết quả.
