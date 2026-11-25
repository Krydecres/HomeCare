import { useTranslation } from 'react-i18next';
import { AppFormatters } from '@/shared/theme/AppFormatters';
import { HcSecondaryButton } from '../buttons/HcSecondaryButton';
import { HcIcon } from '../display/HcIcon';

/** UI-30 / SC-046: offline banner for shift views showing snapshot timestamp and queued offline sync count. NM-0194. */
type HcOfflineBannerProps = {
  snapshotAt?: string | Date;
  pendingCount?: number;
  onRetrySync?: () => void;
};

export function HcOfflineBanner({ snapshotAt, pendingCount = 0, onRetrySync }: HcOfflineBannerProps) {
  const { t } = useTranslation();

  return (
    <aside
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-hc-sm rounded-hc-sm border border-hc-warning bg-hc-warning-subtle px-hc-md py-hc-ms"
    >
      <div className="flex min-w-0 items-start gap-hc-sm text-hc-warning">
        <HcIcon name="wifi_off" dense />
        <div className="flex flex-col">
          <span className="text-hc-body font-semibold text-hc-text-primary">{t('state.offlineTitle')}</span>
          <span className="hc-tabular text-hc-caption text-hc-text-secondary">
            {pendingCount > 0 ? t('state.offlineSyncPending', { count: pendingCount }) : ''}
            {pendingCount > 0 && snapshotAt ? ' · ' : ''}
            {snapshotAt ? t('state.offlineSnapshotAt', { time: AppFormatters.time(snapshotAt) }) : ''}
          </span>
        </div>
      </div>
      {onRetrySync && (
        <HcSecondaryButton dense icon="sync" onClick={onRetrySync}>
          {t('state.offlineRetry')}
        </HcSecondaryButton>
      )}
    </aside>
  );
}
