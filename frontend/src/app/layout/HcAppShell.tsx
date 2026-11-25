import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { HcSideNav } from '@/shared/ui/navigation/HcSideNav';
import { HcTopNav } from '@/shared/ui/navigation/HcTopNav';
import type { Session } from '../auth/useSession';
import { AccountMenu } from './AccountMenu';
import {
  ACCOUNTANT_NAV,
  ADMIN_NAV,
  CAREGIVER_NAV,
  CUSTOMER_NAV,
  DISPATCHER_NAV,
  PARTNER_NAV,
  type NavDef,
} from './navigation';

/**
 * App frame per role (UI-02, UI-10 → UI-13, UI-15). customer/caregiver: HcTopNav; internal roles: HcSideNav;
 * elder: no navigation at all (UI-12). Pages render inside <Outlet/>.
 */
export type ShellVariant = 'customer' | 'caregiver' | 'elder' | 'dispatcher' | 'admin' | 'accountant' | 'partnerOrg';

const SIDE: Record<'dispatcher' | 'admin' | 'accountant' | 'partnerOrg', NavDef[]> = {
  dispatcher: DISPATCHER_NAV,
  admin: ADMIN_NAV,
  accountant: ACCOUNTANT_NAV,
  partnerOrg: PARTNER_NAV,
};

export function HcAppShell({ variant, session }: { variant: ShellVariant; session: Session }) {
  const { t } = useTranslation();
  const label = (items: NavDef[]) => items.map(({ labelKey, ...rest }) => ({ ...rest, label: t(labelKey) }));

  const main = (
    <main id="main" className="mx-auto w-full max-w-hc-content flex-1 p-hc-md pb-hc-xl md:p-hc-xl">
      <Outlet />
    </main>
  );

  if (variant === 'elder') {
    return <div className="hc-elder flex min-h-screen flex-col">{main}</div>;
  }

  if (variant === 'customer' || variant === 'caregiver') {
    const isCaregiverAccount = session.roles.includes('CAREGIVER');
    return (
      <div className="flex min-h-screen flex-col pb-hc-xl md:pb-0">
        <HcTopNav
          role={variant}
          modeLabel={
            isCaregiverAccount ? t(variant === 'caregiver' ? 'auth.modeCaregiver' : 'auth.modeCustomer') : undefined
          }
          items={label(variant === 'caregiver' ? CAREGIVER_NAV : CUSTOMER_NAV)}
          actions={<AccountMenu session={session} />}
        />
        {main}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <HcSideNav
        role={variant}
        title={t('app.name')}
        items={label(SIDE[variant])}
        footer={<AccountMenu session={session} />}
      />
      {main}
    </div>
  );
}
