import type { ButtonHTMLAttributes } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-20: low-emphasis text button with minimum 44px touch target. NM-0188. */
type HcTextButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  tone?: 'primary' | 'danger' | 'neutral';
};

const TONE_CLASS = {
  primary: 'text-hc-primary hover:bg-hc-primary-subtle',
  danger: 'text-hc-danger hover:bg-hc-danger-subtle',
  neutral: 'text-hc-text-secondary hover:bg-hc-neutral-subtle hover:text-hc-text-primary',
} as const;

export function HcTextButton({
  icon,
  tone = 'primary',
  children,
  className = '',
  type = 'button',
  ...rest
}: HcTextButtonProps) {
  return (
    <button
      type={type}
      className={`hc-pressable inline-flex min-h-hc-touch cursor-pointer items-center gap-hc-xs whitespace-nowrap rounded-hc-sm px-hc-ms text-hc-body font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${TONE_CLASS[tone]} ${className}`}
      {...rest}
    >
      {icon && <HcIcon name={icon} dense />}
      <span>{children}</span>
    </button>
  );
}
