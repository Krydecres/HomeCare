import { Switch } from 'radix-ui';
import { useId } from 'react';

/** UI-29d: accessible toggle switch built on Radix Switch. NM-0308. */
type HcSwitchProps = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function HcSwitch({ label, description, checked, onCheckedChange, disabled = false }: HcSwitchProps) {
  const id = useId();
  const labelId = `${id}-label`;

  return (
    <div className="flex min-h-hc-touch items-center justify-between gap-hc-md">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className="flex cursor-pointer flex-col text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span id={labelId} className="text-hc-body font-semibold text-hc-text-primary">
          {label}
        </span>
        {description && <span className="text-hc-caption text-hc-text-secondary">{description}</span>}
      </button>
      <Switch.Root
        id={id}
        checked={checked}
        disabled={disabled}
        aria-labelledby={labelId}
        onCheckedChange={onCheckedChange}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border p-hc-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'border-hc-primary bg-hc-primary' : 'border-hc-border bg-hc-neutral-subtle'
        }`}
      >
        <Switch.Thumb
          className={`block size-5 rounded-full bg-hc-surface shadow-hc-card transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </Switch.Root>
    </div>
  );
}
