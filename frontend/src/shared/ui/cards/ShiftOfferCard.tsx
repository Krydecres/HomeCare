import { useTranslation } from 'react-i18next';
import { AppFormatters } from '@/shared/theme/AppFormatters';
import { HcPrimaryButton } from '../buttons/HcPrimaryButton';
import { HcSecondaryButton } from '../buttons/HcSecondaryButton';
import { HcIcon } from '../display/HcIcon';
import { HcStatusBadge } from '../display/HcStatusBadge';

/**
 * UI-23 / UI-23b / CK-12: shift offer card shown to a caregiver BEFORE acceptance.
 * Shows ward + distance ONLY — never exposes full street address or customer phone prior to acceptance (OQ-011). NM-0190.
 */
type ShiftOfferCardProps = {
  serviceName: string;
  startAt: string | Date;
  endAt: string | Date;
  wardName: string;
  distanceKm: number;
  estimatedNetVnd: number;
  expiresInLabel: string;
  recipientSummary: string;
  safetyWarnings?: string[];
  onAccept: () => void;
  onDecline: () => void;
};

export function ShiftOfferCard({
  serviceName,
  startAt,
  endAt,
  wardName,
  distanceKm,
  estimatedNetVnd,
  expiresInLabel,
  recipientSummary,
  safetyWarnings = [],
  onAccept,
  onDecline,
}: ShiftOfferCardProps) {
  const { t } = useTranslation();

  return (
    <article className="flex flex-col gap-hc-ms rounded-hc-sm border border-hc-primary bg-hc-surface p-hc-md shadow-hc-card">
      <div className="flex flex-wrap items-center justify-between gap-hc-sm">
        <h3 className="m-0 text-hc-subtitle text-hc-text-primary">{serviceName}</h3>
        <HcStatusBadge label={expiresInLabel} tone="warning" icon="timer" />
      </div>

      <div className="flex flex-col gap-hc-xs text-hc-body text-hc-text-primary">
        <p className="hc-tabular m-0 flex items-center gap-hc-xs font-semibold">
          <HcIcon name="schedule" dense className="text-hc-primary" />
          <span>
            {AppFormatters.date(startAt)} · {AppFormatters.time(startAt)} – {AppFormatters.time(endAt)}
          </span>
        </p>
        <p className="hc-tabular m-0 flex items-center gap-hc-xs text-hc-text-secondary">
          <HcIcon name="near_me" dense />
          <span>
            {wardName} · {AppFormatters.distanceKm(distanceKm)}
          </span>
        </p>
        <p className="m-0 flex items-center gap-hc-xs text-hc-text-secondary">
          <HcIcon name="personal_injury" dense />
          <span>{recipientSummary}</span>
        </p>
      </div>

      {safetyWarnings.length > 0 && (
        <div className="flex flex-wrap gap-hc-xs">
          {safetyWarnings.map((warning) => (
            <HcStatusBadge key={warning} label={warning} tone="warning" icon="shield" />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-hc-md border-t border-hc-border pt-hc-ms">
        <div className="flex flex-col">
          <span className="text-hc-caption text-hc-text-secondary">{t('ui.estimatedIncome')}</span>
          <span className="hc-tabular text-hc-title font-bold text-hc-success">
            {AppFormatters.money(estimatedNetVnd)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-hc-sm">
          <HcSecondaryButton dense onClick={onDecline}>
            {t('ui.declineShift')}
          </HcSecondaryButton>
          <HcPrimaryButton dense icon="check" onClick={onAccept}>
            {t('ui.acceptShift')}
          </HcPrimaryButton>
        </div>
      </div>
    </article>
  );
}
