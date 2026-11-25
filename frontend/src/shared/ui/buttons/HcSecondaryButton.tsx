import type { ButtonHTMLAttributes } from 'react';

/** UI-20: outlined secondary button. Minimal version – TV2 owns UI kit (US-15-012). */
type HcSecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { dense?: boolean; fullWidth?: boolean };

export function HcSecondaryButton({
  dense,
  fullWidth,
  className = '',
  type = 'button',
  ...rest
}: HcSecondaryButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-hc-sm rounded-hc-sm border border-hc-primary bg-hc-surface px-hc-lg text-hc-body font-semibold text-hc-primary disabled:opacity-50 ${dense ? 'h-hc-button-dense' : 'h-hc-button'} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    />
  );
}
