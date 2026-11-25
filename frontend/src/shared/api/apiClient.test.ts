import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { apiClient, CSRF_HEADER } from './apiClient';

const seen: { method: string; csrf: string | null }[] = [];
const server = setupServer(
  http.get('*/api/v1/me/session', ({ request }) => {
    seen.push({ method: 'GET', csrf: request.headers.get(CSRF_HEADER) });
    return HttpResponse.json({ roles: ['CUSTOMER'] });
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  seen.length = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

describe('apiClient', () => {
  it('TC-US-15-008-3: GET requests do not carry the CSRF header and never an Authorization header', async () => {
    document.cookie = 'XSRF-TOKEN=abc123';
    let authorization: string | null = 'unset';
    server.use(
      http.get('*/api/v1/me/session', ({ request }) => {
        authorization = request.headers.get('Authorization');
        seen.push({ method: 'GET', csrf: request.headers.get(CSRF_HEADER) });
        return HttpResponse.json({ roles: ['CUSTOMER'] });
      }),
    );

    const { data } = await apiClient.GET('/api/v1/me/session');

    expect(data?.roles).toEqual(['CUSTOMER']);
    expect(seen[0]?.csrf).toBeNull();
    expect(authorization).toBeNull();
  });

  it('TC-US-15-008-4: mutations echo cookie XSRF-TOKEN in X-XSRF-TOKEN', async () => {
    document.cookie = 'XSRF-TOKEN=abc123';
    let header: string | null = null;
    server.use(
      http.post('*/api/v1/otp', ({ request }) => {
        header = request.headers.get(CSRF_HEADER);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    // Path is not in the generated schema yet (identity-service not implemented) – call through the raw client.
    await (apiClient as unknown as { POST: (path: string, init: object) => Promise<unknown> }).POST('/api/v1/otp', {
      body: {},
    });

    expect(header).toBe('abc123');
  });
});
