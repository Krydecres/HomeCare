## Story & phạm vi
- Story ID: US-
- Wireframe (đã duyệt): WF-
- Gói wireframe: G

## Backlog đã cập nhật (bắt buộc, R-11 / R-24)
- [ ] `04_Backlog`: trạng thái story, cột Class/Method chính, Test case
- [ ] `11_Naming_Registry`: tên mới (NM-...) / tên đổi (ghi Tên cũ, trạng thái Renamed)
- [ ] `10_API_Contract` (nếu thêm/sửa API)
- [ ] `12_Data_Dictionary` (nếu thêm/sửa bảng/cột) + Flyway migration
- [ ] `15_Change_Log`
- [ ] Không sửa được Sheet → đã ghi `docs/backlog/PENDING_CHANGES.md`

## Kiến trúc & code thống nhất
- [ ] Đúng service trong `09_Service_Catalog`, đúng package (R-02, R-03)
- [ ] Bắt chước cấu trúc code mẫu chuẩn `docs/GOLDEN_SAMPLE.md` (R-33)
- [ ] UI chỉ dùng component trong `src/shared/ui` + token trong `17_UI_Standards`, không hard-code style (R-32)
- [ ] Đã kiểm tra responsive ở 1440 và 390px (UI-15)
- [ ] Ảnh chụp trang web đặt cạnh wireframe (dán bên dưới)
- [ ] `scripts/check-naming.py` pass trên máy

## Security (R-35)
- [ ] PR có đụng đăng nhập / role / thanh toán / upload / dữ liệu sức khỏe / Keycloak / gateway? → gắn nhãn `security`, chờ TV1 duyệt
- [ ] Không xóa `@PreAuthorize`, không thêm `permitAll`, không tắt CSRF
- [ ] Có test 403 cho role không được phép

## Test
- [ ] Unit test ServiceImpl
- [ ] Integration test (Testcontainers)
- [ ] ArchitectureTest pass
- [ ] Frontend: `pnpm lint`, `pnpm typecheck`, Vitest, Playwright (1440 & 390)

## Người/AI thực hiện
- Thành viên: TV
- Công cụ AI (nếu có):

## Ảnh so sánh với wireframe
| Wireframe | Web (1440) | Web (390) |
|---|---|---|
|  |  |  |
