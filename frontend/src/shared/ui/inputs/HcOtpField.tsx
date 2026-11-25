import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

/** UI-22 / UI-23b: 6-digit OTP input with keyboard navigation and clipboard paste splitting. NM-0189. */
type HcOtpFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  length?: number;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
};

export function HcOtpField({
  label,
  value,
  onChange,
  length = 6,
  required,
  hint,
  error,
  disabled = false,
}: HcOtpFieldProps) {
  const { t } = useTranslation();
  const baseId = useId();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, idx) => value[idx] ?? '');

  const setDigitAt = (index: number, char: string) => {
    const clean = char.replace(/\D/g, '').slice(-1);
    const next = Array.from({ length }, (_, i) => (i === index ? clean : (value[i] ?? ''))).join('');
    onChange(next);
    if (clean && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
      setDigitAt(index - 1, '');
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIdx]?.focus();
  };

  return (
    <fieldset className="flex flex-col gap-hc-xs border-0 p-0">
      <legend className="mb-hc-xs text-hc-body font-semibold text-hc-text-primary">
        {label}
        {required && (
          <span className="ml-hc-xs text-hc-danger" aria-hidden="true">
            *
          </span>
        )}
      </legend>
      <div className="flex flex-wrap gap-hc-sm">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            id={`${baseId}-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            value={digit}
            aria-label={t('ui.otpDigitLabel', { index: index + 1 })}
            aria-invalid={error ? true : undefined}
            onChange={(e) => setDigitAt(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`hc-tabular size-hc-otp rounded-hc-sm border bg-hc-surface text-center text-hc-title font-bold text-hc-text-primary outline-none transition-colors focus:border-hc-primary disabled:opacity-50 ${
              error ? 'border-hc-danger bg-hc-danger-subtle' : 'border-hc-border'
            }`}
          />
        ))}
      </div>
      {error && (
        <p role="alert" className="text-hc-caption font-semibold text-hc-danger">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-hc-caption text-hc-text-secondary">{hint}</p>}
    </fieldset>
  );
}
