import { useTranslation } from 'react-i18next';
import { HcPrimaryButton } from '../buttons/HcPrimaryButton';
import { HcTextButton } from '../buttons/HcTextButton';
import { HcIcon } from '../display/HcIcon';

/** UI-16 / US-15-014: PWA install banner handling both Android beforeinstallprompt and iPhone Safari guidance. NM-0200. */
type HcInstallPwaBannerProps = {
  platform?: 'android' | 'ios';
  onInstall?: () => void;
  onDismiss?: () => void;
};

export function HcInstallPwaBanner({ platform = 'android', onInstall, onDismiss }: HcInstallPwaBannerProps) {
  const { t } = useTranslation();

  return (
    <aside className="flex flex-wrap items-center justify-between gap-hc-md rounded-hc-sm border border-hc-primary bg-hc-primary-subtle p-hc-md">
      <div className="flex min-w-0 flex-1 items-start gap-hc-ms">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-hc-sm bg-hc-primary text-hc-on-primary">
          <HcIcon name={platform === 'ios' ? 'ios_share' : 'install_mobile'} dense />
        </span>
        <div className="flex flex-col gap-hc-xs">
          <h3 className="m-0 text-hc-subtitle text-hc-text-primary">{t('ui.pwaTitle')}</h3>
          <p className="m-0 text-hc-body text-hc-text-secondary">
            {platform === 'ios' ? t('ui.pwaIosHint') : t('ui.pwaAndroidHint')}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-hc-sm">
        {platform === 'android' && onInstall && (
          <HcPrimaryButton dense icon="download" onClick={onInstall}>
            {t('ui.pwaInstall')}
          </HcPrimaryButton>
        )}
        {onDismiss && (
          <HcTextButton tone="neutral" onClick={onDismiss}>
            {t('ui.pwaDismiss')}
          </HcTextButton>
        )}
      </div>
    </aside>
  );
}
