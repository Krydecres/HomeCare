import { useId, type ReactNode } from 'react';

/**
 * UI-29d: card-style single-choice option (schedule type, role choice, quiz answer). Uses native radio input
 * so it integrates seamlessly with both controlled state and React Hook Form. NM-0308.
 */
type HcRadioOptionProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  trailing?: ReactNode;
  disabled?: boolean;
};

export function HcRadioOption({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  trailing,
  disabled = false,
}: HcRadioOptionProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`hc-pressable flex min-h-hc-touch cursor-pointer items-start gap-hc-ms rounded-hc-sm border p-hc-md transition-colors ${
        checked ? 'border-hc-primary bg-hc-primary-subtle' : 'border-hc-border bg-hc-surface hover:border-hc-primary'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`mt-hc-xs flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? 'border-hc-primary bg-hc-primary' : 'border-hc-border bg-hc-surface'
        }`}
      >
        {checked && <span className="size-2 rounded-full bg-hc-on-primary" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-hc-xs">
        <span className="text-hc-body font-semibold text-hc-text-primary">{title}</span>
        {description && <span className="text-hc-caption text-hc-text-secondary">{description}</span>}
      </span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </label>
  );
}
