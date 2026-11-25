import { useTranslation } from 'react-i18next';
import { HcIcon } from './HcIcon';

/** UI-25b: 1–5 star rating control (interactive when onChange is supplied, summary readout otherwise). NM-0309. */
type HcRatingStarsProps = {
  value: number;
  onChange?: (stars: number) => void;
  count?: number;
  label?: string;
};

const STARS = [1, 2, 3, 4, 5] as const;

export function HcRatingStars({ value, onChange, count, label }: HcRatingStarsProps) {
  const { t } = useTranslation();

  if (onChange) {
    return (
      <div
        role="radiogroup"
        aria-label={label ?? t('ui.ratingLabel', { star: value })}
        className="inline-flex items-center gap-hc-xs"
      >
        {STARS.map((star) => {
          const active = star <= value;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={t('ui.ratingLabel', { star })}
              onClick={() => onChange(star)}
              className={`hc-pressable flex size-hc-touch cursor-pointer items-center justify-center rounded-hc-sm ${
                active ? 'text-hc-warning' : 'text-hc-border hover:text-hc-warning'
              }`}
            >
              <HcIcon name="star" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-hc-xs" aria-label={t('ui.ratingLabel', { star: value })}>
      <div className="inline-flex items-center">
        {STARS.map((star) => (
          <HcIcon
            key={star}
            name="star"
            dense
            className={star <= Math.round(value) ? 'text-hc-warning' : 'text-hc-border'}
          />
        ))}
      </div>
      <span className="hc-tabular text-hc-body font-semibold text-hc-text-primary">
        {value.toFixed(1).replace('.', ',')}
      </span>
      {count !== undefined && <span className="hc-tabular text-hc-caption text-hc-text-secondary">({count})</span>}
    </div>
  );
}
