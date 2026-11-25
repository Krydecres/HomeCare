import type { ButtonHTMLAttributes } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-20: outlined secondary button. NM-0188. */
type HcSecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  dense?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: string;
};

export function HcSecondaryButton({
  dense,
  fullWidth,
  loading = false,
  icon,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: HcSecondaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`hc-pressable inline-flex cursor-pointer items-center justify-center gap-hc-sm whitespace-nowrap rounded-hc-sm border border-hc-primary bg-hc-surface px-hc-lg text-hc-body font-semibold text-hc-primary hover:bg-hc-primary-subtle disabled:cursor-not-allowed disabled:opacity-50 ${
        dense ? 'h-hc-button-dense px-hc-md' : 'h-hc-button'
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <HcIcon name="progress_activity" dense className="animate-spin" />
      ) : (
        icon && <HcIcon name={icon} dense />
      )}
      <span>{children}</span>
    </button>
  );
}
