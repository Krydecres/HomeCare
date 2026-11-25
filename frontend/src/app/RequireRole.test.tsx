import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/renderRoute';

const server = setupServer();
const sessionAs = (roles: string[]) =>
  http.get('*/api/v1/me/session', () => HttpResponse.json({ fullName: 'Phạm Minh Tuấn', roles }));
const anonymous = http.get('*/api/v1/me/session', () =>
  HttpResponse.json({ status: 401, errorCode: 'SESSION_EXPIRED' }, { status: 401 }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RequireRole + router (US-15-008)', () => {
  it('TC-US-15-008-6: anonymous user opening /admin is sent back to the splash page', async () => {
    server.use(anonymous);
    const router = renderRoute('/admin');
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(await screen.findByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('TC-US-15-008-7: CUSTOMER opening /admin gets the forbidden page (no admin menu rendered)', async () => {
    server.use(sessionAs(['CUSTOMER']));
    const router = renderRoute('/admin/users');
    await waitFor(() => expect(router.state.location.pathname).toBe('/forbidden'));
    expect(screen.queryByText('Người dùng')).not.toBeInTheDocument();
  });

  it('TC-US-15-008-8: ADMIN sees the internal sidebar of UI-13', async () => {
    server.use(sessionAs(['ADMIN']));
    renderRoute('/admin');
    expect((await screen.findAllByRole('link', { name: 'Duyệt nhân viên' })).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Nhật ký' }).length).toBeGreaterThan(0);
  });

  it('TC-US-15-008-9: logged-in CUSTOMER on "/" is redirected to the customer home with the top menu', async () => {
    server.use(sessionAs(['CUSTOMER']));
    const router = renderRoute('/');
    await waitFor(() => expect(router.state.location.pathname).toBe('/customer'));
    expect((await screen.findAllByRole('link', { name: 'Lịch đặt' })).length).toBeGreaterThan(0);
  });

  it('shows the error state with retry when the gateway is down', async () => {
    server.use(http.get('*/api/v1/me/session', () => HttpResponse.json({}, { status: 503 })));
    renderRoute('/customer');
    expect(await screen.findByRole('button', { name: 'Thử lại' }, { timeout: 8000 })).toBeInTheDocument();
  }, 10_000);
});
