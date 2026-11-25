import { useTranslation } from 'react-i18next';
import { HcIcon } from './HcIcon';

/** UI-25 / UI-23b: circular avatar with initials fallback and verified badge overlay. NM-0191. */
type HcVerifiedAvatarProps = {
  name: string;
  src?: string;
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'HC';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

const SIZE_CLASSES = {
  sm: 'size-hc-avatar text-hc-body',
  md: 'size-hc-avatar text-hc-subtitle',
  lg: 'size-hc-avatar-lg text-hc-title',
} as const;

export function HcVerifiedAvatar({ name, src, verified = false, size = 'md' }: HcVerifiedAvatarProps) {
  const { t } = useTranslation();
  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${SIZE_CLASSES[size]} rounded-full border border-hc-border object-cover`}
        />
      ) : (
        <div
          aria-label={name}
          className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-full border border-hc-primary bg-hc-primary-subtle font-bold text-hc-primary`}
        >
          {initialsFromName(name)}
        </div>
      )}
      {verified && (
        <span
          title={t('ui.verifiedBadge')}
          aria-label={t('ui.verifiedBadge')}
          className="absolute -bottom-hc-xs -right-hc-xs flex size-5 items-center justify-center rounded-full border border-hc-surface bg-hc-success text-hc-on-primary shadow-hc-card"
        >
          <HcIcon name="check" dense />
        </span>
      )}
    </div>
  );
}
