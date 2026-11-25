import type { ReactNode } from 'react';
import type { HcStatusTone } from '@/shared/lib/statusMeta';
import { HcTimelineItem } from './HcTimelineItem';

/** UI-25: shift/incident/booking milestone timeline. NM-0191. */
export type HcTimelineEntry = {
  id: string;
  title: string;
  time: string;
  detail?: string;
  actor?: string;
  tone?: HcStatusTone;
  icon?: string;
};

type HcTimelineProps = {
  items?: HcTimelineEntry[];
  children?: ReactNode;
};

export function HcTimeline({ items, children }: HcTimelineProps) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {items
        ? items.map((item, idx) => <HcTimelineItem key={item.id} {...item} isLast={idx === items.length - 1} />)
        : children}
    </ol>
  );
}
