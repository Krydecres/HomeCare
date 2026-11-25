import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { HcStatusBadge } from '../display/HcStatusBadge';

/**
 * UI-27 / UI-23b / US-08-005: clinical vital sign input with configurable warn/danger thresholds.
 * Evaluates numeric input and highlights warning or danger (suggesting 115/SOS without diagnosing). NM-0193.
 */
export type VitalAlertState = 'normal' | 'warning' | 'danger';

type VitalSignFieldProps = {
  label: string;
  unit: string;
  value: string;
  onChange: (next: string) => void;
  warnLow?: number;
  warnHigh?: number;
  dangerLow?: number;
  dangerHigh?: number;
  placeholder?: string;
  required?: boolean;
  error?: string;
};

function evaluateVital(
  raw: string,
  {
    warnLow,
    warnHigh,
    dangerLow,
    dangerHigh,
  }: Pick<VitalSignFieldProps, 'warnLow' | 'warnHigh' | 'dangerLow' | 'dangerHigh'>,
): VitalAlertState | null {
  if (!raw.trim()) return null;
  const num = Number(raw);
  if (Number.isNaN(num)) return null;
  if ((dangerLow !== undefined && num < dangerLow) || (dangerHigh !== undefined && num > dangerHigh)) {
    return 'danger';
  }
  if ((warnLow !== undefined && num < warnLow) || (warnHigh !== undefined && num > warnHigh)) {
    return 'warning';
  }
  return 'normal';
}

export function VitalSignField({
  label,
  unit,
  value,
  onChange,
  warnLow,
  warnHigh,
  dangerLow,
  dangerHigh,
  placeholder,
  required,
  error,
}: VitalSignFieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const status = evaluateVital(value, { warnLow, warnHigh, dangerLow, dangerHigh });

  const borderClass =
    error || status === 'danger' ? 'border-hc-danger' : status === 'warning' ? 'border-hc-warning' : 'border-hc-border';

  return (
    <div className="flex flex-col gap-hc-xs">
      <div className="flex flex-wrap items-center justify-between gap-hc-xs">
        <label htmlFor={id} className="text-hc-body font-semibold text-hc-text-primary">
          {label}
          {required && (
            <span className="ml-hc-xs text-hc-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {status === 'normal' && <HcStatusBadge label={t('ui.vitalNormal')} tone="success" icon="check_circle" />}
        {status === 'warning' && <HcStatusBadge label={t('ui.vitalWarning')} tone="warning" icon="warning" />}
        {status === 'danger' && <HcStatusBadge label={t('ui.vitalDanger')} tone="danger" icon="emergency" />}
      </div>

      <div
        className={`flex h-hc-button items-center gap-hc-sm rounded-hc-sm border bg-hc-surface px-hc-ms focus-within:border-hc-primary ${borderClass}`}
      >
        <input
          id={id}
          type="number"
          step="any"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          required={required}
          aria-invalid={error || status === 'danger' ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="hc-tabular h-full min-w-0 flex-1 bg-transparent text-hc-body font-semibold text-hc-text-primary outline-none"
        />
        <span className="shrink-0 rounded-hc-sm bg-hc-neutral-subtle px-hc-sm py-hc-xs text-hc-caption font-semibold text-hc-text-secondary">
          {unit}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-hc-caption font-semibold text-hc-danger">
          {error}
        </p>
      )}
    </div>
  );
}
