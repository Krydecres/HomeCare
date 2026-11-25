import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-22: labeled text/textarea input with top label, required * mark, helper hint, and inline error. NM-0189. */
type BaseProps = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  leadingIcon?: string;
  trailing?: ReactNode;
  multiline?: boolean;
  rows?: number;
};

type SingleLineProps = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> & { multiline?: false };
type MultiLineProps = BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> & { multiline: true };

type HcTextFieldProps = SingleLineProps | MultiLineProps;

export function HcTextField(props: HcTextFieldProps) {
  const generatedId = useId();
  const {
    id = generatedId,
    label,
    required,
    hint,
    error,
    leadingIcon,
    trailing,
    multiline,
    rows = 3,
    className = '',
    ...rest
  } = props;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const wrapperClass = `flex w-full items-center gap-hc-sm rounded-hc-sm border bg-hc-surface px-hc-ms transition-colors focus-within:border-hc-primary ${
    error ? 'border-hc-danger' : 'border-hc-border'
  }`;

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
      <div className={wrapperClass}>
        {leadingIcon && <HcIcon name={leadingIcon} dense className="text-hc-text-secondary" />}
        {multiline ? (
          <textarea
            id={id}
            rows={rows}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="w-full resize-y bg-transparent py-hc-sm text-hc-body text-hc-text-primary outline-none placeholder:text-hc-text-secondary"
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={id}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="h-hc-button w-full bg-transparent text-hc-body text-hc-text-primary outline-none placeholder:text-hc-text-secondary"
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {trailing}
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
