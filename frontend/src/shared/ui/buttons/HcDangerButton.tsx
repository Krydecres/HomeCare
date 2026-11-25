import type { ButtonHTMLAttributes } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-20: destructive action button (cancel booking, revoke access, delete). NM-0188. */
type HcDangerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  dense?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: string;
};

export function HcDangerButton({
  dense,
  fullWidth,
  loading = false,
  icon,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: HcDangerButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`hc-pressable inline-flex cursor-pointer items-center justify-center gap-hc-sm whitespace-nowrap rounded-hc-sm bg-hc-danger px-hc-lg text-hc-body font-semibold text-hc-on-primary shadow-hc-card hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 ${
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
