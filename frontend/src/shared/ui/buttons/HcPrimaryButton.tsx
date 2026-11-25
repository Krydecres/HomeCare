import type { ButtonHTMLAttributes } from 'react';

/** UI-20: one primary button per screen, label is a verb. Height 48 (40 when dense). Minimal version – TV2 owns UI kit. */
type HcPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { dense?: boolean; fullWidth?: boolean };

export function HcPrimaryButton({ dense, fullWidth, className = '', type = 'button', ...rest }: HcPrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-hc-sm rounded-hc-sm bg-hc-primary px-hc-lg text-hc-body font-semibold text-hc-on-primary disabled:opacity-50 ${dense ? 'h-hc-button-dense' : 'h-hc-button'} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    />
  );
}
