import type { ButtonHTMLAttributes } from 'react';

/** UI-20: text button. Minimal version – TV2 owns UI kit (US-15-012). */
export function HcTextButton({ className = '', type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-hc-touch items-center gap-hc-xs rounded-hc-sm px-hc-sm text-hc-body font-semibold text-hc-primary ${className}`}
      {...rest}
    />
  );
}
