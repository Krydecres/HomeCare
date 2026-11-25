import { Navigate } from 'react-router';
import { HcErrorState } from '@/shared/ui/states/HcErrorState';
import { HcLoading } from '@/shared/ui/states/HcLoading';
import type { AppRole } from './auth/roles';
import { useSession } from './auth/useSession';
import { HcAppShell, type ShellVariant } from './layout/HcAppShell';

/**
 * Client-side route guard by role (US-15-008, 13_RBAC). It only hides screens: the real check is done again by the
 * gateway (session) and by every service (@PreAuthorize on the JWT).
 */
export function RequireRole({ anyOf, variant }: { anyOf: AppRole[]; variant: ShellVariant }) {
  const { data: session, isPending, isError, refetch } = useSession();

  if (isPending) return <HcLoading />;
  if (isError) return <HcErrorState onRetry={() => void refetch()} />;
  if (!session) return <Navigate to="/" replace />;
  if (!anyOf.some((role) => session.roles.includes(role))) return <Navigate to="/forbidden" replace />;

  return <HcAppShell variant={variant} session={session} />;
}
