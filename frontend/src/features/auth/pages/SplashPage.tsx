// WF-S-01 Splash & chọn vai trò (US-15-008). NM-0122.
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router';
import { resolveHomePath } from '@/app/auth/roles';
import { useModeStore } from '@/app/auth/useModeStore';
import { useSession } from '@/app/auth/useSession';
import { redirectToLogin } from '@/shared/api/apiClient';
import { HcPrimaryButton } from '@/shared/ui/buttons/HcPrimaryButton';
import { HcIcon } from '@/shared/ui/display/HcIcon';
import { HcErrorState } from '@/shared/ui/states/HcErrorState';
import { HcLoading } from '@/shared/ui/states/HcLoading';

const roleOptionClass =
  'flex min-h-hc-touch items-center gap-hc-md rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md text-left hover:border-hc-primary';

export function SplashPage() {
  const { t } = useTranslation();
  const { data: session, isPending, isError, refetch } = useSession();
  const mode = useModeStore((state) => state.mode);

  if (isPending) return <HcLoading />;
  if (isError) return <HcErrorState onRetry={() => void refetch()} />;
  if (session) return <Navigate to={resolveHomePath(session.roles, mode)} replace />;

  return (
    <main id="main" className="flex min-h-screen flex-col lg:flex-row">
      <section className="flex flex-1 flex-col justify-center gap-hc-lg bg-hc-primary p-hc-xl text-hc-on-primary">
        <div className="flex items-center gap-hc-sm">
          <HcIcon name="home_health" />
          <span className="text-hc-title">{t('app.name')}</span>
        </div>
        <h1 className="text-hc-display">{t('splash.title')}</h1>
        <p className="text-hc-body">{t('splash.subtitle')}</p>
      </section>

      <section className="flex flex-1 items-center justify-center p-hc-lg md:p-hc-xl">
        <div className="flex w-full max-w-hc-sidebar flex-col gap-hc-md sm:max-w-hc-content lg:max-w-none">
          <h2 className="text-hc-title">{t('splash.chooseRole')}</h2>
          <Link to="/register?as=customer" className={roleOptionClass}>
            <HcIcon name="family_restroom" className="text-hc-primary" />
            <span className="flex flex-col">
              <span className="text-hc-subtitle">{t('splash.needCare')}</span>
              <span className="text-hc-caption text-hc-text-secondary">{t('splash.needCareHint')}</span>
            </span>
          </Link>
          <Link to="/register?as=caregiver" className={roleOptionClass}>
            <HcIcon name="medical_services" className="text-hc-primary" />
            <span className="flex flex-col">
              <span className="text-hc-subtitle">{t('splash.isCaregiver')}</span>
              <span className="text-hc-caption text-hc-text-secondary">{t('splash.isCaregiverHint')}</span>
            </span>
          </Link>
          <p className="pt-hc-md text-hc-body text-hc-text-secondary">{t('splash.haveAccount')}</p>
          <HcPrimaryButton fullWidth onClick={redirectToLogin}>
            {t('splash.login')}
          </HcPrimaryButton>
        </div>
      </section>
    </main>
  );
}
