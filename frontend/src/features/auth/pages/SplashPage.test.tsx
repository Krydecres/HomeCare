import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/renderRoute';

const server = setupServer(
  http.get('*/api/v1/me/session', () => HttpResponse.json({ errorCode: 'SESSION_EXPIRED' }, { status: 401 })),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('SplashPage (WF-S-01)', () => {
  it('TC-US-15-008-10: shows the two role choices and the login button', async () => {
    renderRoute('/');

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Chăm sóc người thân tại nhà');
    expect(screen.getByRole('link', { name: /Tôi cần chăm sóc/ })).toHaveAttribute('href', '/register?as=customer');
    expect(screen.getByRole('link', { name: /Tôi là nhân viên/ })).toHaveAttribute('href', '/register?as=caregiver');
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeEnabled();
  });
});
