import { HcIcon } from '../display/HcIcon';

/** UI-29a: KPI metric card with tabular figures, trend delta, and optional quick-filter click action. NM-0194. */
export type HcKpiDelta = {
  value: string;
  tone: 'up' | 'down' | 'neutral';
  label?: string;
};

type HcKpiCardProps = {
  label: string;
  value: string | number;
  icon?: string;
  delta?: HcKpiDelta;
  hint?: string;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  active?: boolean;
  onClick?: () => void;
};

const ICON_WELL_CLASSES: Record<NonNullable<HcKpiCardProps['tone']>, string> = {
  default: 'bg-hc-neutral-subtle text-hc-text-primary',
  primary: 'bg-hc-primary-subtle text-hc-primary',
  success: 'bg-hc-success-subtle text-hc-success',
  warning: 'bg-hc-warning-subtle text-hc-warning',
  danger: 'bg-hc-danger-subtle text-hc-danger',
};

const DELTA_CLASSES: Record<HcKpiDelta['tone'], { badge: string; icon: string }> = {
  up: { badge: 'bg-hc-success-subtle text-hc-success', icon: 'trending_up' },
  down: { badge: 'bg-hc-danger-subtle text-hc-danger', icon: 'trending_down' },
  neutral: { badge: 'bg-hc-neutral-subtle text-hc-text-secondary', icon: 'remove' },
};

export function HcKpiCard({
  label,
  value,
  icon,
  delta,
  hint,
  tone = 'primary',
  active = false,
  onClick,
}: HcKpiCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-hc-sm">
        <span className="text-hc-caption font-semibold text-hc-text-secondary">{label}</span>
        {icon && (
          <span
            aria-hidden="true"
            className={`flex size-10 shrink-0 items-center justify-center rounded-hc-sm ${ICON_WELL_CLASSES[tone]}`}
          >
            <HcIcon name={icon} dense />
          </span>
        )}
      </div>

      <div className="hc-tabular text-hc-display text-hc-text-primary">{value}</div>

      {(delta || hint) && (
        <div className="flex flex-wrap items-center gap-hc-sm">
          {delta && (
            <span
              className={`hc-tabular inline-flex items-center gap-hc-xs rounded-full px-hc-sm py-hc-xs text-hc-caption font-semibold ${DELTA_CLASSES[delta.tone].badge}`}
            >
              <HcIcon name={DELTA_CLASSES[delta.tone].icon} dense />
              <span>{delta.value}</span>
              {delta.label && <span className="font-normal opacity-90">{delta.label}</span>}
            </span>
          )}
          {hint && <span className="text-hc-caption text-hc-text-secondary">{hint}</span>}
        </div>
      )}
    </>
  );

  const surfaceClass = active
    ? 'border-hc-primary bg-hc-primary-subtle shadow-hc-card'
    : 'border-hc-border bg-hc-surface shadow-hc-card';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`hc-pressable flex min-h-hc-touch w-full cursor-pointer flex-col justify-between gap-hc-sm rounded-hc-sm border p-hc-md text-left hover:border-hc-primary ${surfaceClass}`}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={`flex flex-col justify-between gap-hc-sm rounded-hc-sm border p-hc-md ${surfaceClass}`}>
      {content}
    </article>
  );
}
