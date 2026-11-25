import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ApiError } from '@/shared/api/apiClient';
import i18n from '@/shared/i18n/i18n';
import { SESSION_QUERY_KEY } from './auth/useSession';
import { useAuthStore } from './auth/useAuthStore';

/** Server state (TanStack Query) + i18n. A 401 anywhere marks the session expired and refreshes "who am I". */
export function createQueryClient() {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          useAuthStore.getState().markSessionExpired();
          void client.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
        }
      },
    }),
    defaultOptions: { queries: { refetchOnWindowFocus: false } },
  });
  return client;
}

export function AppProviders({ children, client }: { children: ReactNode; client?: QueryClient }) {
  const [queryClient] = useState(() => client ?? createQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </QueryClientProvider>
  );
}
