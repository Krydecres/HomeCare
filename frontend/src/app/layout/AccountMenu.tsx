import { useQueryClient } from '@tanstack/react-query';
import { DropdownMenu } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { logout } from '@/shared/api/apiClient';
import { HcIcon } from '@/shared/ui/display/HcIcon';
import { resolveHomePath } from '../auth/roles';
import { useModeStore } from '../auth/useModeStore';
import type { Session } from '../auth/useSession';

/** HcTopNav/AccountMenu (UI-17): mode switch for CAREGIVER accounts + logout (API-SV01-002). */
export function AccountMenu({ session }: { session: Session }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mode, setMode } = useModeStore();
  const canSwitch = session.roles.includes('CAREGIVER');

  const switchMode = () => {
    const next = mode === 'caregiver' ? 'customer' : 'caregiver';
    setMode(next);
    void navigate(resolveHomePath(session.roles, next));
  };

  const signOut = async () => {
    await logout();
    queryClient.clear();
    void navigate('/', { replace: true });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex min-h-hc-touch items-center gap-hc-xs rounded-hc-sm px-hc-sm text-hc-body text-hc-text-primary"
        aria-label={t('auth.account')}
      >
        <HcIcon name="account_circle" />
        <span className="hidden md:inline">{session.fullName}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-40 flex min-w-hc-sidebar flex-col gap-hc-xs rounded-hc-md border border-hc-border bg-hc-surface p-hc-sm shadow-hc-card"
        >
          {canSwitch && (
            <DropdownMenu.Item
              onSelect={switchMode}
              className="flex min-h-hc-touch cursor-pointer items-center gap-hc-sm rounded-hc-sm px-hc-sm text-hc-body outline-none data-highlighted:bg-hc-neutral-subtle"
            >
              <HcIcon name="swap_horiz" dense />
              {mode === 'caregiver' ? t('auth.switchToCustomer') : t('auth.switchToCaregiver')}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            onSelect={() => void signOut()}
            className="flex min-h-hc-touch cursor-pointer items-center gap-hc-sm rounded-hc-sm px-hc-sm text-hc-body outline-none data-highlighted:bg-hc-neutral-subtle"
          >
            <HcIcon name="logout" dense />
            {t('auth.logout')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
