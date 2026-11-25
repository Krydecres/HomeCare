import createClient, { type Middleware } from 'openapi-fetch';
import type { components, paths } from './schema';

/**
 * The only HTTP client of the web app (R-19, R-21, NM-0295). Types come from the gateway's OpenAPI
 * (`pnpm gen:api`), never hand-written.
 *
 * - Same origin only: the browser talks to api-gateway (BFF) with the HttpOnly session cookie (R-08).
 * - CSRF: every non-GET request echoes cookie XSRF-TOKEN in header X-XSRF-TOKEN.
 * - No token is ever read or stored here.
 */
export const CSRF_COOKIE = 'XSRF-TOKEN';
export const CSRF_HEADER = 'X-XSRF-TOKEN';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export type ProblemDetail = { status?: number; detail?: string; errorCode?: string };
export type SessionResponse = components['schemas']['SessionResponse'];

export function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  return document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

/** Thrown by hooks when the API answers with a ProblemDetail (R-19). */
export class ApiError extends Error {
  readonly status: number;
  readonly errorCode: string | undefined;

  constructor(status: number, problem: ProblemDetail | undefined) {
    super(problem?.detail ?? `HTTP ${status}`);
    this.status = status;
    this.errorCode = problem?.errorCode;
  }
}

const csrfMiddleware: Middleware = {
  onRequest({ request }) {
    if (!SAFE_METHODS.has(request.method)) {
      const token = readCookie(CSRF_COOKIE);
      if (token) request.headers.set(CSRF_HEADER, decodeURIComponent(token));
    }
    return request;
  },
};

export const apiClient = createClient<paths>({
  baseUrl: window.location.origin,
  credentials: 'same-origin',
  // Resolve fetch at call time (service worker / test mocks patch it after this module loads).
  fetch: (request) => globalThis.fetch(request),
});
apiClient.use(csrfMiddleware);

/** POST /logout (API-SV01-002). Uses the same CSRF rule as every mutation. */
export async function logout(): Promise<void> {
  const token = readCookie(CSRF_COOKIE);
  await fetch(new URL('/logout', window.location.origin), {
    method: 'POST',
    credentials: 'same-origin',
    headers: token ? { [CSRF_HEADER]: decodeURIComponent(token) } : {},
  });
}

/** Full-page navigation to the BFF login (API-SV01-001); Keycloak never runs inside the SPA. */
export function redirectToLogin(): void {
  window.location.assign('/oauth2/authorization/keycloak');
}
