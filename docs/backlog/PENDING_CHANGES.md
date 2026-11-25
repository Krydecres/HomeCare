# PENDING_CHANGES — Thay đổi backlog chờ đưa lên Google Sheet

Dùng file này khi AI hoặc thành viên **không sửa trực tiếp được Google Sheet**.
Người điều khiển AI chuyển từng mục lên Sheet, sau đó xóa mục khỏi file này **trước khi merge PR**.

## Mẫu ghi

| Sheet | ID / dòng | Cột | Giá trị cũ | Giá trị mới | Lý do | Người/AI | Ngày |
|---|---|---|---|---|---|---|---|
| 11_Naming_Registry | NM-0xxx | Tên hiện tại | createBooking | placeBooking | Thống nhất thuật ngữ | AI: Cursor (TV2) | 2026-xx-xx |

## Thay đổi đang chờ

| Sheet | ID / dòng | Cột | Giá trị cũ | Giá trị mới | Lý do | Người/AI | Ngày |
|---|---|---|---|---|---|---|---|
| 11_Naming_Registry | NM-0188 → NM-0196, NM-0198, NM-0200, NM-0295, NM-0308, NM-0309 | Trạng thái | Approved / Renamed | Implemented | Đã implement trọn bộ React UI Kit, statusMeta & UiGalleryPage (`/dev/ui`) trong `US-15-012` (chuyển sang Implemented khi merge PR) | AI: Antigravity (TV2) | 2026-11-26 |
| 04_Backlog | US-15-012 | Ghi chú / Review | — | Chờ TV3 review PR UI Kit; TV1 review edit nhỏ tại `frontend/src/app/router.tsx` (mount dev route `/dev/ui`, R-35) | Hoàn thành code + test (Vitest + Playwright 1440×900 & 390×844) | AI: Antigravity (TV2) | 2026-11-26 |
