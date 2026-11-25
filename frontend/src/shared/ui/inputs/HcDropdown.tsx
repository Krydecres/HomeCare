import { Select } from 'radix-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';

/** UI-22: accessible dropdown built on Radix Select. NM-0189. */
export type HcDropdownOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type HcDropdownProps = {
  label: string;
  options: HcDropdownOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  error?: string;
  name?: string;
};

export function HcDropdown({
  label,
  options,
  value,
  onValueChange,
  placeholder,
  required,
  disabled,
  hint,
  error,
  name,
}: HcDropdownProps) {
  const { t } = useTranslation();
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-hc-xs">
      <span id={labelId} className="text-hc-body font-semibold text-hc-text-primary">
        {label}
        {required && (
          <span className="ml-hc-xs text-hc-danger" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <Select.Root value={value} onValueChange={onValueChange} disabled={disabled} name={name} required={required}>
        <Select.Trigger
          id={id}
          aria-labelledby={labelId}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className={`flex h-hc-button w-full cursor-pointer items-center justify-between gap-hc-sm rounded-hc-sm border bg-hc-surface px-hc-ms text-left text-hc-body text-hc-text-primary data-placeholder:text-hc-text-secondary disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? 'border-hc-danger' : 'border-hc-border hover:border-hc-primary'
          }`}
        >
          <Select.Value placeholder={placeholder ?? t('ui.selectPlaceholder')} />
          <Select.Icon>
            <HcIcon name="expand_more" dense className="text-hc-text-secondary" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="hc-select-content z-50 max-h-72 overflow-hidden rounded-hc-md border border-hc-border bg-hc-surface p-hc-xs shadow-hc-elevated"
          >
            <Select.Viewport className="flex flex-col gap-hc-xs">
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="flex min-h-hc-touch cursor-pointer items-center justify-between gap-hc-sm rounded-hc-sm px-hc-ms py-hc-sm text-hc-body text-hc-text-primary outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-hc-primary-subtle data-highlighted:text-hc-primary"
                >
                  <div className="flex flex-col">
                    <Select.ItemText>{opt.label}</Select.ItemText>
                    {opt.description && (
                      <span className="text-hc-caption text-hc-text-secondary">{opt.description}</span>
                    )}
                  </div>
                  <Select.ItemIndicator>
                    <HcIcon name="check" dense className="text-hc-primary" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
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
