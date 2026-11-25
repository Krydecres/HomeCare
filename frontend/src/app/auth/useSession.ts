import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError, type ProblemDetail, type SessionResponse } from '@/shared/api/apiClient';
import { toAppRoles, type AppRole } from './roles';

export type Session = Omit<SessionResponse, 'roles'> & { roles: AppRole[] };

export const SESSION_QUERY_KEY = ['me', 'session'] as const;

/**
 * GET /api/v1/me/session (API-SV01-003). Returns null when not logged in (401 SESSION_EXPIRED) – NM-0295.
 * The session lives server-side (gateway + Redis); this hook only caches "who am I" for routing and menus.
 */
export async function fetchSession(): Promise<Session | null> {
  const { data, error, response } = await apiClient.GET('/api/v1/me/session');
  const status: number = response.status;
  if (status === 401) return null;
  if (error || !data) throw new ApiError(status, error as ProblemDetail | undefined);
  return { ...data, roles: toAppRoles(data.roles) };
}

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 60_000,
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
  });
}
