import type { HcStatusTone } from '@/shared/lib/statusMeta';
import { HcIcon } from './HcIcon';

/** UI-24 / UI-03b: status pill pairing label text, icon/dot, and solid subtle token background (never opacity). NM-0191. */
type HcStatusBadgeProps = {
  label: string;
  tone?: HcStatusTone;
  icon?: string;
};

const TONE_CLASSES: Record<HcStatusTone, string> = {
  neutral: 'bg-hc-neutral-subtle text-hc-text-primary border-hc-border',
  primary: 'bg-hc-primary-subtle text-hc-primary border-hc-primary',
  info: 'bg-hc-info-subtle text-hc-info border-hc-info',
  success: 'bg-hc-success-subtle text-hc-success border-hc-success',
  warning: 'bg-hc-warning-subtle text-hc-warning border-hc-warning',
  danger: 'bg-hc-danger-subtle text-hc-danger border-hc-danger',
};

const DOT_CLASSES: Record<HcStatusTone, string> = {
  neutral: 'bg-hc-text-secondary',
  primary: 'bg-hc-primary',
  info: 'bg-hc-info',
  success: 'bg-hc-success',
  warning: 'bg-hc-warning',
  danger: 'bg-hc-danger',
};

export function HcStatusBadge({ label, tone = 'neutral', icon }: HcStatusBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-hc-xs rounded-full border px-hc-ms py-hc-xs text-left text-hc-caption font-semibold sm:whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {icon ? (
        <HcIcon name={icon} dense />
      ) : (
        <span aria-hidden="true" className={`size-hc-badge-dot rounded-full ${DOT_CLASSES[tone]}`} />
      )}
      <span>{label}</span>
    </span>
  );
}
