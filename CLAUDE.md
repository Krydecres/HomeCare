# CLAUDE.md

Đọc và tuân thủ TUYỆT ĐỐI @AGENTS.md trước mọi tác vụ.

- Backlog gốc: Google Sheet "BacklogSOA". Nếu có công cụ Google Sheets, đọc trực tiếp sheet `01_AI_RULES` và các sheet liên quan; nếu không, đọc `docs/backlog/*.csv`.
- Tên/API/bảng/cột không cần ai duyệt: tìm trong `11` / `10` / `12` trước, có thì dùng lại, chưa có thì tự thêm dòng (`Approved`) trong cùng phiên rồi dùng.
- Khi đổi tên bất kỳ class/hàm/biến/bảng/cột/endpoint/event: cập nhật `11_Naming_Registry` (cột "Tên cũ", `Renamed`) + `15_Change_Log` trong cùng phiên, thêm `10_API_Contract` nếu đổi hợp đồng gói khác đang dùng (hoặc ghi vào `docs/backlog/PENDING_CHANGES.md`).
- Cần thứ của gói khác mà chưa có → khai báo tượng trưng theo hợp đồng (R-37, AGENTS.md mục 4e), không dừng chờ.
- Chỉ dừng hỏi người dùng khi đụng việc tầng C (R-36) hoặc security lõi (R-35).
- Chỉ kiến trúc SOA microservice + Spring MVC theo `09_Service_Catalog`. Không tự ý đổi kiến trúc.
- Trả lời và viết tài liệu bằng tiếng Việt; code, tên, commit message bằng tiếng Anh.
