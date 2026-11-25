import { useTranslation } from 'react-i18next';
import { HcPrimaryButton } from '../buttons/HcPrimaryButton';
import { HcIcon } from '../display/HcIcon';

/** UI-16 / SC-046: unified browser permission state (prompt | denied) with browser enablement guidance. NM-0194, NM-0200. */
export type HcBrowserPermission = 'geolocation' | 'camera' | 'notifications';

type HcPermissionStateProps = {
  permission: HcBrowserPermission;
  status: 'prompt' | 'denied';
  onRequest?: () => void;
};

const PERMISSION_META: Record<HcBrowserPermission, { icon: string; nameKey: string; guideKey: string }> = {
  geolocation: { icon: 'location_off', nameKey: 'ui.permissionGeo', guideKey: 'ui.permissionGeoGuide' },
  camera: { icon: 'no_photography', nameKey: 'ui.permissionCamera', guideKey: 'ui.permissionCameraGuide' },
  notifications: {
    icon: 'notifications_off',
    nameKey: 'ui.permissionNotifications',
    guideKey: 'ui.permissionNotifGuide',
  },
};

export function HcPermissionState({ permission, status, onRequest }: HcPermissionStateProps) {
  const { t } = useTranslation();
  const meta = PERMISSION_META[permission];
  const permLabel = t(meta.nameKey);
  const denied = status === 'denied';

  return (
    <section
      role={denied ? 'alert' : 'status'}
      className={`flex flex-wrap items-center justify-between gap-hc-md rounded-hc-sm border p-hc-md ${
        denied ? 'border-hc-warning bg-hc-warning-subtle' : 'border-hc-info bg-hc-info-subtle'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-hc-ms">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-hc-surface shadow-hc-card ${
            denied ? 'text-hc-warning' : 'text-hc-info'
          }`}
        >
          <HcIcon name={meta.icon} dense />
        </span>
        <div className="flex flex-col gap-hc-xs">
          <h3 className="m-0 text-hc-subtitle text-hc-text-primary">
            {denied
              ? t('ui.permissionDenied', { permission: permLabel })
              : t('ui.permissionPrompt', { permission: permLabel })}
          </h3>
          <p className="m-0 text-hc-body text-hc-text-secondary">{t(meta.guideKey)}</p>
        </div>
      </div>
      {status === 'prompt' && onRequest && (
        <HcPrimaryButton dense onClick={onRequest}>
          {t('ui.permissionGrant')}
        </HcPrimaryButton>
      )}
    </section>
  );
}
