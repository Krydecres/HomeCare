import { useId, type InputHTMLAttributes } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-22 / UI-23b: Vietnamese phone input (+84 prefix, tel keypad). NM-0189. */
type HcPhoneFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode'> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

export function HcPhoneField({
  id: providedId,
  label,
  required,
  hint,
  error,
  className = '',
  ...rest
}: HcPhoneFieldProps) {
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
        <HcIcon name="call" dense className="text-hc-text-secondary" />
        <span className="hc-tabular rounded-hc-sm bg-hc-neutral-subtle px-hc-sm py-hc-xs text-hc-caption font-semibold text-hc-text-secondary">
          +84
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className="hc-tabular h-full w-full bg-transparent text-hc-body text-hc-text-primary outline-none placeholder:text-hc-text-secondary"
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
