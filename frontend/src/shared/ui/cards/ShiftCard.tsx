import type { ReactNode } from 'react';
import { shiftStatusMeta } from '@/shared/lib/statusMeta';
import { AppFormatters } from '@/shared/theme/AppFormatters';
import { HcIcon } from '../display/HcIcon';
import { HcStatusBadge } from '../display/HcStatusBadge';

/** UI-23 / UI-41: single shift card for customer or caregiver schedules. NM-0190. */
type ShiftStatusKey = keyof typeof shiftStatusMeta;

type ShiftCardProps = {
  shiftCode: string;
  serviceName: string;
  recipientName: string;
  locationLabel: string;
  startAt: string | Date;
  endAt: string | Date;
  status: ShiftStatusKey;
  caregiverName?: string;
  actions?: ReactNode;
};

export function ShiftCard({
  shiftCode,
  serviceName,
  recipientName,
  locationLabel,
  startAt,
  endAt,
  status,
  caregiverName,
  actions,
}: ShiftCardProps) {
  const statusInfo = shiftStatusMeta[status];

  return (
    <article className="flex flex-col gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
      <div className="flex flex-wrap items-center justify-between gap-hc-sm">
        <span className="hc-tabular rounded-hc-sm bg-hc-neutral-subtle px-hc-sm py-hc-xs text-hc-caption font-bold text-hc-text-primary">
          {shiftCode}
        </span>
        <HcStatusBadge label={statusInfo.label} tone={statusInfo.tone} icon={statusInfo.icon} />
      </div>

      <div className="flex flex-col gap-hc-xs">
        <h3 className="m-0 text-hc-subtitle text-hc-text-primary">{serviceName}</h3>
        <p className="hc-tabular m-0 flex items-center gap-hc-xs text-hc-body font-semibold text-hc-primary">
          <HcIcon name="event" dense />
          <span>
            {AppFormatters.date(startAt)} · {AppFormatters.time(startAt)} – {AppFormatters.time(endAt)}
          </span>
        </p>
        <p className="m-0 flex items-center gap-hc-xs text-hc-body text-hc-text-secondary">
          <HcIcon name="person" dense />
          <span>{recipientName}</span>
        </p>
        <p className="m-0 flex items-center gap-hc-xs text-hc-body text-hc-text-secondary">
          <HcIcon name="location_on" dense />
          <span>{locationLabel}</span>
        </p>
        {caregiverName && (
          <p className="m-0 flex items-center gap-hc-xs text-hc-caption font-semibold text-hc-text-primary">
            <HcIcon name="badge" dense className="text-hc-primary" />
            <span>{caregiverName}</span>
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center justify-end gap-hc-sm border-t border-hc-border pt-hc-ms">
          {actions}
        </div>
      )}
    </article>
  );
}
