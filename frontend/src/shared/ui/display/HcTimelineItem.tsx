import type { HcStatusTone } from '@/shared/lib/statusMeta';
import { HcIcon } from './HcIcon';

/** UI-29b: single chronological entry inside HcTimeline. NM-0196. */
type HcTimelineItemProps = {
  title: string;
  time: string;
  detail?: string;
  actor?: string;
  tone?: HcStatusTone;
  icon?: string;
  isLast?: boolean;
};

const NODE_TONE: Record<HcStatusTone, string> = {
  neutral: 'bg-hc-neutral-subtle text-hc-text-secondary border-hc-border',
  primary: 'bg-hc-primary-subtle text-hc-primary border-hc-primary',
  info: 'bg-hc-info-subtle text-hc-info border-hc-info',
  success: 'bg-hc-success-subtle text-hc-success border-hc-success',
  warning: 'bg-hc-warning-subtle text-hc-warning border-hc-warning',
  danger: 'bg-hc-danger-subtle text-hc-danger border-hc-danger',
};

export function HcTimelineItem({
  title,
  time,
  detail,
  actor,
  tone = 'primary',
  icon = 'radio_button_checked',
  isLast = false,
}: HcTimelineItemProps) {
  return (
    <li className="relative flex gap-hc-ms pb-hc-md last:pb-0">
      <div className="flex flex-col items-center">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${NODE_TONE[tone]}`}
          aria-hidden="true"
        >
          <HcIcon name={icon} dense />
        </span>
        {!isLast && <span className="mt-hc-xs w-0.5 flex-1 bg-hc-border" aria-hidden="true" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-hc-xs pt-hc-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-hc-sm">
          <span className="text-hc-body font-semibold text-hc-text-primary">{title}</span>
          <time className="hc-tabular text-hc-caption text-hc-text-secondary">{time}</time>
        </div>
        {detail && <p className="m-0 text-hc-body text-hc-text-secondary">{detail}</p>}
        {actor && <span className="text-hc-caption font-semibold text-hc-text-secondary">{actor}</span>}
      </div>
    </li>
  );
}
