import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFormatters } from '@/shared/theme/AppFormatters';
import { HcIcon } from '../display/HcIcon';
import { HcRatingStars } from '../display/HcRatingStars';
import { HcStatusBadge } from '../display/HcStatusBadge';
import { HcVerifiedAvatar } from '../display/HcVerifiedAvatar';

/** UI-23: public caregiver profile card (never exposes home coordinates or full ID numbers). NM-0190. */
type CaregiverCardProps = {
  displayName: string;
  roleTitle: string;
  level: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  distanceKm?: number;
  verifiedBadges?: string[];
  avatarSrc?: string;
  actions?: ReactNode;
};

export function CaregiverCard({
  displayName,
  roleTitle,
  level,
  rating,
  reviewCount,
  yearsExperience,
  distanceKm,
  verifiedBadges = [],
  avatarSrc,
  actions,
}: CaregiverCardProps) {
  const { t } = useTranslation();

  return (
    <article className="flex flex-col gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
      <div className="flex items-start gap-hc-ms">
        <HcVerifiedAvatar name={displayName} src={avatarSrc} verified size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-hc-xs">
          <div className="flex flex-wrap items-center justify-between gap-hc-xs">
            <h3 className="m-0 truncate text-hc-subtitle text-hc-text-primary">{displayName}</h3>
            <HcStatusBadge label={level} tone="primary" icon="workspace_premium" />
          </div>
          <span className="text-hc-body text-hc-text-secondary">{roleTitle}</span>
          <div className="flex flex-wrap items-center gap-x-hc-md gap-y-hc-xs">
            <HcRatingStars value={rating} count={reviewCount} />
            <span className="hc-tabular text-hc-caption font-semibold text-hc-text-secondary">
              {t('ui.yearsExp', { years: yearsExperience })}
            </span>
            {distanceKm !== undefined && (
              <span className="hc-tabular inline-flex items-center gap-hc-xs text-hc-caption text-hc-text-secondary">
                <HcIcon name="near_me" dense />
                <span>{AppFormatters.distanceKm(distanceKm)}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {verifiedBadges.length > 0 && (
        <div className="flex flex-wrap gap-hc-xs">
          {verifiedBadges.map((badge) => (
            <HcStatusBadge key={badge} label={badge} tone="success" icon="verified_user" />
          ))}
        </div>
      )}

      {actions && (
        <div className="flex flex-wrap items-center justify-end gap-hc-sm border-t border-hc-border pt-hc-ms">
          {actions}
        </div>
      )}
    </article>
  );
}
