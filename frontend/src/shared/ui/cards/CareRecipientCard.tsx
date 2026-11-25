import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';
import { HcStatusBadge } from '../display/HcStatusBadge';
import { HcVerifiedAvatar } from '../display/HcVerifiedAvatar';

/** UI-23: care recipient summary card with safety/dependency flags. NM-0190. */
type CareRecipientCardProps = {
  fullName: string;
  ageLabel: string;
  relationship: string;
  addressSummary: string;
  mobilityLabel: string;
  livesAlone?: boolean;
  hasAllergies?: boolean;
  actions?: ReactNode;
};

export function CareRecipientCard({
  fullName,
  ageLabel,
  relationship,
  addressSummary,
  mobilityLabel,
  livesAlone = false,
  hasAllergies = false,
  actions,
}: CareRecipientCardProps) {
  const { t } = useTranslation();

  return (
    <article className="flex flex-col gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
      <div className="flex items-start gap-hc-ms">
        <HcVerifiedAvatar name={fullName} size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-hc-xs">
          <div className="flex flex-wrap items-center justify-between gap-hc-xs">
            <h3 className="m-0 text-hc-subtitle text-hc-text-primary">{fullName}</h3>
            <span className="text-hc-caption font-semibold text-hc-text-secondary">
              {ageLabel} · {relationship}
            </span>
          </div>
          <p className="m-0 flex items-center gap-hc-xs text-hc-body text-hc-text-secondary">
            <HcIcon name="home_pin" dense />
            <span>{addressSummary}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-hc-xs">
        <HcStatusBadge label={mobilityLabel} tone="info" icon="accessibility_new" />
        {livesAlone && <HcStatusBadge label={t('ui.livesAloneFlag')} tone="warning" icon="person_alert" />}
        {hasAllergies && <HcStatusBadge label={t('ui.allergyTitle')} tone="danger" icon="warning" />}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center justify-end gap-hc-sm border-t border-hc-border pt-hc-ms">
          {actions}
        </div>
      )}
    </article>
  );
}
