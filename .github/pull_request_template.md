## Story & phạm vi
- Story ID: US-
- Wireframe: WF-
- Thành viên / công cụ AI: TV / 

## Checklist (CI xanh → tự merge, R-34)
- [ ] Tên / API / bảng-cột mới đã thêm vào `11` / `10` / `12` (tìm trước, có thì dùng lại – R-10, R-14); đổi tên → `11` (Tên cũ, Renamed) + `15_Change_Log` (R-11)
- [ ] Không sửa được Sheet → đã ghi `docs/backlog/PENDING_CHANGES.md`
- [ ] Đúng service trong `09_Service_Catalog`, đúng package, theo mẫu `_template` / `docs/GOLDEN_SAMPLE.md` (R-02, R-03, R-33)
- [ ] UI chỉ dùng component trong `src/shared/ui` + token; responsive 1440 & 390 (R-32, UI-15)
- [ ] Test: unit ServiceImpl, integration (Testcontainers), ArchitectureTest, test 403; frontend lint / typecheck / Vitest / Playwright
- [ ] Không xóa `@PreAuthorize`, không thêm `permitAll`, không tắt CSRF (R-35)

## Cần báo / cần review (bỏ trống nếu không có)
- [ ] Tầng C (R-36): đổi/xóa hợp đồng gói khác đang dùng, sửa/xóa code dùng chung hoặc code gói khác → đã tag chủ: @… , hạn merge: … (24h)
- [ ] Security LÕI (Keycloak, gateway, `src/app`, callback thanh toán/payout, cấp role CAREGIVER) → nhãn `security`, TV1 review (hạn 48h)
- [ ] Security THƯỜNG (upload, dữ liệu sức khỏe) → nhãn `security`, tự merge, TV1 hậu kiểm

## Ảnh so sánh với wireframe (nếu có UI)
| Wireframe | Web (1440) | Web (390) |
|---|---|---|
|  |  |  |
