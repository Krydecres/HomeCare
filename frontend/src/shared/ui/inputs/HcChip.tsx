import { HcIcon } from '../display/HcIcon';

/** UI-29d: quick-selection filter/tag chip (skills, weekdays, tip amount, category filter). NM-0308. */
type HcChipProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: string;
  count?: number;
  disabled?: boolean;
};

export function HcChip({ label, selected = false, onClick, icon, count, disabled = false }: HcChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={`hc-pressable inline-flex min-h-hc-touch cursor-pointer items-center gap-hc-xs whitespace-nowrap rounded-full border px-hc-md text-hc-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? 'border-hc-primary bg-hc-primary-subtle text-hc-primary'
          : 'border-hc-border bg-hc-surface text-hc-text-secondary hover:border-hc-primary hover:text-hc-text-primary'
      }`}
    >
      {icon && <HcIcon name={icon} dense />}
      <span>{label}</span>
      {count !== undefined && (
        <span className="hc-tabular rounded-full bg-hc-neutral-subtle px-hc-sm text-hc-caption text-hc-text-primary">
          {count}
        </span>
      )}
    </button>
  );
}
