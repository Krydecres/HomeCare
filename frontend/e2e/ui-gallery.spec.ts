import { expect, test, type Page } from '@playwright/test';

/** US-15-012: dev-only Design System Gallery at 1440×900 and 390×844 (TC-US-15-012-9 & 10). */
async function stubExternalMapTiles(page: Page) {
  await page.route('https://*.tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"/>',
    }),
  );
}

async function assertNoHorizontalOverflow(page: Page, viewportWidth: number, label: string) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `no horizontal scroll on ${label}`).toBeLessThanOrEqual(viewportWidth);
}

test('TC-US-15-012-9: all UI gallery tabs render with zero overflow and live elder scaling works', async ({
  page,
}, testInfo) => {
  await stubExternalMapTiles(page);
  const width = testInfo.project.use.viewport?.width ?? 1440;

  await page.goto('/dev/ui');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Bộ chuẩn giao diện HomeCare');
  await assertNoHorizontalOverflow(page, width, 'foundations tab');

  const elderToggle = page.getByRole('switch', { name: /Chế độ người cao tuổi/ });
  await elderToggle.click();
  await expect(page.locator('.hc-elder')).toBeVisible();

  const tabsToVisit = [
    { name: /Nút & Điều hướng/, marker: 'Nút SOS khẩn cấp trong ca (UI-21)' },
    { name: /Biểu mẫu & Nhập liệu/, marker: 'Mã xác thực OTP bàn giao ca' },
    { name: /Thẻ nghiệp vụ & Y tế/, marker: 'Bà Nguyễn Thị Lan' },
    { name: /Bảng, Biểu đồ & Trạng thái/, marker: 'Lịch chăm sóc 7 ngày gần nhất' },
  ];

  for (const tab of tabsToVisit) {
    await page.getByRole('tab', { name: tab.name }).click();
    await expect(page.getByText(tab.marker).first()).toBeVisible();
    await assertNoHorizontalOverflow(page, width, String(tab.name));
  }
});

test('TC-US-15-012-10: overlays and responsive data table adapt cleanly between 1440px and 390px', async ({
  page,
}, testInfo) => {
  await stubExternalMapTiles(page);
  await page.goto('/dev/ui');

  // Verify dialog & bottom sheet open and dismiss cleanly
  await page.getByRole('tab', { name: /Nút & Điều hướng/ }).click();
  await page.getByRole('button', { name: 'Mở Hộp thoại xác nhận' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  await page.getByRole('button', { name: 'Mở Bottom Sheet' }).click();
  await expect(page.getByRole('dialog', { name: 'Chọn nhanh điều dưỡng phù hợp' })).toBeVisible();
  await page.getByRole('button', { name: 'Đóng' }).click();

  // Verify responsive table/cards + detail drawer
  await page.getByRole('tab', { name: /Bảng, Biểu đồ & Trạng thái/ }).click();
  if (testInfo.project.name === 'phone-390') {
    await expect(page.locator('table')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Bà Nguyễn Thị Lan (78 tuổi)' })).toBeVisible();
  } else {
    await expect(page.locator('table')).toBeVisible();
  }

  await page.getByRole('button', { name: 'Xem chi tiết' }).filter({ visible: true }).first().click();
  await expect(page.getByRole('heading', { name: /Chi tiết đơn BK-000123/ })).toBeVisible();
  await page.getByRole('button', { name: 'Đóng khung chi tiết' }).click();
  await expect(page.getByRole('heading', { name: /Chi tiết đơn BK-000123/ })).toBeHidden();
});
