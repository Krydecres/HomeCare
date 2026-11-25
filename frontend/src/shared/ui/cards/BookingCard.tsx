import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { bookingStatusMeta, urgencyMeta } from '@/shared/lib/statusMeta';
import { AppFormatters } from '@/shared/theme/AppFormatters';
import { HcIcon } from '../display/HcIcon';
import { HcStatusBadge } from '../display/HcStatusBadge';

/** UI-23 / UI-40: standardized booking summary card. NM-0190. */
type BookingStatusKey = keyof typeof bookingStatusMeta;
type UrgencyKey = keyof typeof urgencyMeta;

type BookingCardProps = {
  bookingCode: string;
  serviceName: string;
  recipientName: string;
  wardName: string;
  startAt: string | Date;
  durationMinutes: number;
  totalVnd: number;
  status: BookingStatusKey;
  urgency?: UrgencyKey;
  caregiverName?: string;
  actions?: ReactNode;
};

export function BookingCard({
  bookingCode,
  serviceName,
  recipientName,
  wardName,
  startAt,
  durationMinutes,
  totalVnd,
  status,
  urgency,
  caregiverName,
  actions,
}: BookingCardProps) {
  const { t } = useTranslation();
  const statusInfo = bookingStatusMeta[status];
  const urgencyInfo = urgency ? urgencyMeta[urgency] : undefined;

  return (
    <article className="flex flex-col gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
      <div className="flex flex-wrap items-center justify-between gap-hc-sm">
        <div className="flex items-center gap-hc-sm">
          <span className="hc-tabular rounded-hc-sm bg-hc-neutral-subtle px-hc-sm py-hc-xs text-hc-caption font-bold text-hc-text-primary">
            {bookingCode}
          </span>
          {urgencyInfo && urgency !== 'NORMAL' && (
            <HcStatusBadge label={urgencyInfo.label} tone={urgencyInfo.tone} icon={urgencyInfo.icon} />
          )}
        </div>
        <HcStatusBadge label={statusInfo.label} tone={statusInfo.tone} icon={statusInfo.icon} />
      </div>

      <div className="flex flex-col gap-hc-xs">
        <h3 className="m-0 text-hc-subtitle text-hc-text-primary">{serviceName}</h3>
        <div className="flex flex-wrap items-center gap-x-hc-md gap-y-hc-xs text-hc-body text-hc-text-secondary">
          <span className="inline-flex items-center gap-hc-xs">
            <HcIcon name="person" dense />
            <span>{recipientName}</span>
          </span>
          <span className="inline-flex items-center gap-hc-xs">
            <HcIcon name="location_on" dense />
            <span>{wardName}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-hc-md gap-y-hc-xs text-hc-body text-hc-text-primary">
          <span className="hc-tabular inline-flex items-center gap-hc-xs">
            <HcIcon name="schedule" dense className="text-hc-primary" />
            <span>
              {AppFormatters.dateTime(startAt)} · {AppFormatters.duration(durationMinutes)}
            </span>
          </span>
          {caregiverName && (
            <span className="inline-flex items-center gap-hc-xs text-hc-primary">
              <HcIcon name="medical_services" dense />
              <span>{caregiverName}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-hc-sm border-t border-hc-border pt-hc-ms">
        <div className="flex flex-col">
          <span className="text-hc-caption text-hc-text-secondary">{t('ui.totalAmount')}</span>
          <span className="hc-tabular text-hc-subtitle font-bold text-hc-primary">{AppFormatters.money(totalVnd)}</span>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-hc-sm">{actions}</div>}
      </div>
    </article>
  );
}
