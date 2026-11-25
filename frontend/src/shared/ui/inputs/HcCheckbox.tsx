import { Checkbox } from 'radix-ui';
import { useId } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-29d: accessible checkbox built on Radix Checkbox with 44px touch alignment. NM-0308. */
type HcCheckboxProps = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
};

export function HcCheckbox({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  required,
  error,
}: HcCheckboxProps) {
  const id = useId();
  const labelId = `${id}-label`;

  return (
    <div className="flex flex-col gap-hc-xs">
      <div className="flex items-start gap-hc-sm">
        <Checkbox.Root
          id={id}
          checked={checked}
          disabled={disabled}
          required={required}
          aria-labelledby={labelId}
          aria-invalid={error ? true : undefined}
          onCheckedChange={(state) => onCheckedChange(state === true)}
          className={`mt-hc-xs flex size-hc-md shrink-0 cursor-pointer items-center justify-center rounded-hc-sm border p-hc-ms text-hc-on-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? 'border-hc-primary bg-hc-primary' : 'border-hc-border bg-hc-surface'
          }`}
        >
          <Checkbox.Indicator>
            <HcIcon name="check" dense />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCheckedChange(!checked)}
          className="flex min-h-hc-touch cursor-pointer flex-col justify-center text-left disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span id={labelId} className="text-hc-body text-hc-text-primary">
            {label}
            {required && (
              <span className="ml-hc-xs text-hc-danger" aria-hidden="true">
                *
              </span>
            )}
          </span>
          {description && <span className="text-hc-caption text-hc-text-secondary">{description}</span>}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-hc-caption font-semibold text-hc-danger">
          {error}
        </p>
      )}
    </div>
  );
}
