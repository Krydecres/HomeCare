import { expect, test, type Page } from '@playwright/test';

/** US-15-008: splash (WF-S-01) + role-based shell, at 1440 and 390 (UI-15). */
async function mockSession(page: Page, roles: string[] | null) {
  await page.route('**/api/v1/me/session', (route) =>
    roles
      ? route.fulfill({ json: { fullName: 'Phạm Minh Tuấn', roles, csrfToken: 't' } })
      : route.fulfill({ status: 401, json: { errorCode: 'SESSION_EXPIRED' } }),
  );
}

test('TC-US-15-008-11: anonymous visitor sees WF-S-01 and the login button points to the BFF', async ({ page }) => {
  await mockSession(page, null);
  let loginRequested = false;
  await page.route('**/oauth2/authorization/keycloak', (route) => {
    loginRequested = true;
    return route.fulfill({ status: 200, body: 'login' });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Chăm sóc người thân tại nhà');
  await expect(page.getByRole('link', { name: /Tôi cần chăm sóc/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Tôi là nhân viên/ })).toBeVisible();

  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect.poll(() => loginRequested).toBe(true);
});

test('TC-US-15-008-12: customer gets the top navigation (bottom bar on phone)', async ({ page }, testInfo) => {
  await mockSession(page, ['CUSTOMER']);
  await page.goto('/');
  await expect(page).toHaveURL(/\/customer$/);
  await expect(page.getByRole('link', { name: 'Lịch đặt' }).filter({ visible: true })).toBeVisible();
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, 'no horizontal scroll').toBeLessThanOrEqual(testInfo.project.use.viewport?.width ?? 1440);
});

test('TC-US-15-008-13: admin gets the internal sidebar; on phone it opens from the menu button', async ({
  page,
}, testInfo) => {
  await mockSession(page, ['ADMIN']);
  await page.goto('/admin');
  if (testInfo.project.name === 'phone-390') {
    await page.getByRole('button', { name: 'Mở menu' }).click();
  }
  await expect(page.getByRole('link', { name: 'Nhật ký' }).filter({ visible: true })).toBeVisible();
});

test('TC-US-15-008-14: customer cannot open the admin area', async ({ page }) => {
  await mockSession(page, ['CUSTOMER']);
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/forbidden$/);
  await expect(page.getByText('Bạn không có quyền xem trang này')).toBeVisible();
});
