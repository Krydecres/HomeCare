import { useId, type InputHTMLAttributes } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-22 / UI-23b: date, time, or datetime picker in Vietnamese 24h style. NM-0189. */
type HcDateTimePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  mode?: 'date' | 'time' | 'datetime-local';
  required?: boolean;
  hint?: string;
  error?: string;
};

export function HcDateTimePicker({
  id: providedId,
  label,
  mode = 'datetime-local',
  required,
  hint,
  error,
  className = '',
  ...rest
}: HcDateTimePickerProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={`flex flex-col gap-hc-xs ${className}`}>
      <label htmlFor={id} className="text-hc-body font-semibold text-hc-text-primary">
        {label}
        {required && (
          <span className="ml-hc-xs text-hc-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div
        className={`flex h-hc-button items-center gap-hc-sm rounded-hc-sm border bg-hc-surface px-hc-ms focus-within:border-hc-primary ${
          error ? 'border-hc-danger' : 'border-hc-border'
        }`}
      >
        <HcIcon name={mode === 'time' ? 'schedule' : 'calendar_today'} dense className="text-hc-text-secondary" />
        <input
          id={id}
          type={mode}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className="hc-tabular h-full w-full bg-transparent text-hc-body text-hc-text-primary outline-none"
          {...rest}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-hc-caption font-semibold text-hc-danger">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-hc-caption text-hc-text-secondary">
          {hint}
        </p>
      )}
    </div>
  );
}
