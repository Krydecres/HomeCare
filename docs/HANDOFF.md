# HANDOFF – Dự án HomeCare (dán nguyên file này vào phiên AI mới)

> Cập nhật: 24/11/2026. Người điều khiển: TV1 (Phạm Hữu Đức) – chủ dự án, security lead, người vẽ toàn bộ wireframe.
> Trả lời bằng tiếng Việt. Code/tên/commit bằng tiếng Anh.

## 1. Nguồn sự thật (đọc trước khi làm bất cứ gì)
- Google Sheet "BacklogSOA": https://docs.google.com/spreadsheets/d/1vDcaNERk0rVuWwJB1E1nSSgjEPIZZiWqv06KFli6ick
  - Đọc theo thứ tự: 00_README → 01_AI_RULES (R-00 → R-36, cột 'Tầng' A/B/C, prompt P-1 vẽ / P-2 code) → 02_Tech_Stack → 09_Service_Catalog
    → các sheet liên quan việc đang làm (04 Backlog, 05 Scenarios, 06 OQ, 08 Wireframes, 10 API, 11 Naming, 12 Data, 13 RBAC,
    14 Glossary, 16 WF_Packages, 17 UI_Standards, 18 Code_Packages). Mọi thay đổi ghi 15_Change_Log (đang tới CL-0015).
  - Quy ước sheet: không xóa dòng (đổi Deprecated). Từ 26/11/2026 (CL-0025) tên/API/bảng KHÔNG cần duyệt: tìm trong 10/11/12,
    có thì dùng lại, chưa có thì tự thêm dòng (Approved). Chủ gói tự duyệt story. Chỉ việc tầng C (R-36) / security lõi (R-35) mới phải báo.
- Repo files mẫu (chưa có git remote): AGENTS.md, CLAUDE.md, .github/copilot-instructions.md, .github/pull_request_template.md,
  scripts/check-naming.py (quét Java + TSX, chấp nhận mọi tên đã đăng ký trừ Deprecated, chặn Deprecated + cột "Tên cũ"),
  scripts/export-backlog.sh (export CSV các sheet, gid 0,101…118,199), docs/backlog/PENDING_CHANGES.md.

## 2. Quyết định đã chốt (không hỏi lại)
- Kiến trúc: SOA microservice + Spring Boot 4.1 (Java 25, Spring Cloud 2025.1). 15 service (SV01–SV15) + Keycloak (SV00) + web-app (SV16).
  Controller → Service(+Impl) → Repository; DTO record + MapStruct; RabbitMQ `homecare.events` + Outbox; schema-per-service.
- Frontend: **1 web React** (Vite + TS strict, TanStack Query, Zustand, RHF + Zod, React Router 7, Tailwind 4 + Radix, component Hc*),
  PWA, responsive (UI-15). **Bỏ app mobile/Flutter** (OQ-036). api-gateway là **BFF**: trình duyệt không giữ token.
- Tên sản phẩm: HomeCare (OQ-040). Thí điểm phường Quy Nhơn Nam, Gia Lai. Nhóm: người già, người bệnh, mẹ & bé; có 24/7 và trông bệnh viện.
- Nhân viên (cả điều dưỡng lẫn người chăm sóc không chuyên) **bắt buộc thuộc 1 bệnh viện đối tác**; Admin chỉ kiểm tra sơ bộ,
  **bệnh viện duyệt cuối** và duyệt mọi lần đổi vai trò / đổi bệnh viện (OQ-037 b, OQ-039). Chuyển Khách ↔ Nhân viên chỉ đổi giao diện.
- Tiền ca chia 3: nhân viên / bệnh viện / nền tảng. Phần bệnh viện **trích từ hoa hồng nền tảng**, mặc định 5% giá ca (OQ-041 b).
- Wireframe: **chỉ desktop 1440×900**, vẽ trên **Penpot**. Figma cũ chỉ giữ WF đã đạt.
- Chia việc code: sheet 18_Code_Packages (TV1 security: identity, gateway/BFF, Keycloak, report/audit; TV2 customer/catalog/review + UI kit;
  TV3 care-record/incident/notification; TV4 caregiver/dispatch; TV5 booking/payment). PR security phải TV1 duyệt (R-35).

## 3. Công cụ & ID
- Penpot file "HomeCare WireFrame": https://design.penpot.app/?screen=workspace&team-id=7d3e61e0-34c6-81f6-8008-fe7015675a42&project-id=7d3e61e0-34c6-81f6-8008-fe70156846c0&file-id=3db45ae8-1dfd-81ce-8008-fe72eb7a99ee
  - 6 page: "00 – Design System" (board gốc id b06a062f-6ef5-8040-8008-fe77e3bad3b5), "G1 – Khung web Khách & Nhân viên (TV2)",
    "G2 – Đặt lịch & thanh toán khách (TV5)", "G3 – Trong ca & SOS (TV3)", "G4 – Nhân viên & bệnh viện duyệt (TV4)",
    "G5 – Web nội bộ & bệnh viện (TV1)" (page id b06a062f-6ef5-8040-8008-fe7564a0bc3d).
  - Link board dán vào 08 cột H theo mẫu: <link file>&page-id=<pageId>&board-id=<boardId>
  - Thư viện: 17 màu (primary #1C5D6B…, *Subtle), 5 typography (display 28/700, title 20/600, subtitle 18/600, body 16/400, caption 13/400,
    Be Vietnam Pro), token set "homecare", icon font "Material Symbols Rounded" (gõ tên icon, ví dụ `home`).
  - ~40 component: HcPrimary/Secondary/Danger/TextButton, HcStatusBadge (Tone: Neutral/Primary/Info/Success/Warning/Danger),
    HcTextField (State), HcDropdown, HcKpiCard, HcSideNav/Item (State), HcSideNav (Role: Dispatcher/Admin/Accountant/PartnerOrg),
    HcTopNav (Role: Customer/Caregiver), HcTopNav/AccountMenu, HcPageHeader, HcTabs/Tab, HcDataTable/HeaderCell|Cell|BadgeCell|ActionCell,
    HcDetailDrawer/Header, HcMapView, HcLineChart, HcBarChart, HcTimeline/Item, HcEmptyState, HcErrorState, HcLoading, HcConfirmDialog,
    HcFilterBar, _Annotation/Note, HcSosButton, HcEmergencyBanner, HcStepper, HcPermissionState, HcInstallPwaBanner, HcSnackbar, HcOfflineBanner.
- Figma cũ (chỉ xem): file key 5Km9fXbsl6ZhWjeILfWmPk – giữ WF-D-01, D-02, D-06, A-01, A-03, A-04, A-05, A-08, K-03, D-05.

## 4. Mẹo kỹ thuật Penpot MCP (rút ra khi vẽ)
- Tab Penpot phải mở ở cửa sổ riêng, không thu nhỏ; plugin MCP đang "connected". Báo "tab suspended" → nhờ người dùng bấm vào tab.
- Mỗi execute_code < 60 giây: chia nhỏ (1 màn hình = 3–4 lần gọi). Biến `storage` mất khi plugin tải lại → phải dựng lại helper.
- Không đọc `penpot.currentUser` (thiếu quyền). Tên shape không được chứa "/" (trừ tên component qua `component.path`).
- Bản sao component (instance) không appendChild được → bọc trong board thường. Instance tạo tự do phải `penpot.root.appendChild(inst)`.
- Sau khi đổi `characters` của text trong instance phải `text.applyTypography(lib typography)` lại (nếu không chữ bị đậm).
- Đổi biến thể: `instance.switchVariant(0, 'Active')`; đổi xong text về mặc định của biến thể → set lại chữ.
- Tạo nhóm biến thể: `penpotUtils.createVariantContainer([{shape, properties:{Prop: 'Value'}}])`, sau đó thêm flex cho container.
- Kiểm tra bằng `export_shape` từng board sau khi vẽ; dò chữ bị cắt/tràn.

## 5. Trạng thái wireframe (64 WF, sheet 08)
- Xong & "Chờ duyệt" trên Penpot (G5): WF-A-10, WF-P-02, WF-K-01, WF-K-04 (mỗi cái có frame trạng thái + ghi chú, CK 12/12).
- Giữ trên Figma (đạt/chờ duyệt): D-01, D-02, D-06, A-01, A-03, A-04, A-05, A-08 (G5), K-03 (G4), D-05 (G2 – cần dán link + chuyển Chờ duyệt).
- Còn phải vẽ trên Penpot (trạng thái "Chưa vẽ"; cột Ghi chú sheet 08 ghi rõ phải sửa gì):
  - G4: WF-N-15, WF-P-01, WF-A-02 (Admin chỉ "Chuyển bệnh viện duyệt"), WF-K-02 (thêm payout bệnh viện), N-01→N-04, N-06→N-08, N-12 (hiện chia tiền), N-13, N-14
  - G1: WF-S-01→S-09 (S-02 thêm chọn bệnh viện, S-05 thêm chuyển chế độ), C-01, C-18, N-05, A-06, A-07
  - G2: C-02→C-09, C-14, C-15, C-16
  - G3: C-10→C-13, C-17, N-09, N-10, N-11 (N-09/N-10 thêm "Chưa cấp quyền"), D-03, D-04, A-09
- Quy trình mỗi WF (R-28 → R-31, P-1): tạo board trống 1440×900 đúng page gói, đúng tên "WF-ID Tên" → dán link cột H sheet 08 → "Đang vẽ"
  → vẽ chỉ bằng component/token của 17_UI_Standards + đủ trạng thái UI-30 + dữ liệu mẫu UI-52 → frame "WF-ID / Trạng thái (...)" + _Annotation/Note
  → tự chạy CK-01→CK-12 → ghi "CK pass" cột L → "Chờ duyệt". Cần component/nhãn mới → thêm dòng Proposed vào 17 rồi hỏi TV1.

## 6. Việc tiếp theo (theo thứ tự)
1. Vẽ tiếp wireframe: G4 → G1 → G2 → G3 (4–6 WF mỗi lượt), cập nhật 08 + 15_Change_Log.
2. ĐÃ KHAI BÁO (24/11, trạng thái Proposed – từ 26/11 không cần duyệt, dùng được ngay, R-14):
   - 10_API_Contract: 195 API (API-SV01-001 → API-SV15-005), mỗi API có DTO, role, story, errorCode.
   - 12_Data_Dictionary: DD-0001 → DD-0140 (~75 bảng; mỗi dòng có thể gom vài cột cùng bảng; quy ước chung DD-0001→0008).
   - 11_Naming_Registry: NM-0207 → NM-0295 (Controller/Service/Entity/Repository/DTO/Mapper/Enum/Client theo service, frontend hook).
     Quy ước ô tên: phân cách , ; | ; "(+ …ServiceImpl)" = mỗi XxxService có XxxServiceImpl (check-naming.py đã hiểu).
   - Khi code thiếu tên/API/cột → tự thêm dòng mới (Approved) trong cùng PR (KHÔNG đặt tên ngoài sheet), không cần ai duyệt.
3. Code: mỗi gói làm song song (18_Code_Packages, GĐ0–GĐ2 không còn tuần tự; code mẫu US-15-011 không chặn ai). Mỗi phiên code dán prompt P-2.

## 7. Câu hỏi còn mở
- Không còn OQ "Mở" quan trọng. Tỷ lệ hoa hồng nền tảng mặc định theo OQ-005/OQ-008 (20% trong wireframe chỉ là số minh họa).
