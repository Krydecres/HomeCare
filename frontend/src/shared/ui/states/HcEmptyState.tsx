import type { ReactNode } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-30 "Trống": icon + title + hint + action inside a clean bounded card. NM-0194. */
type HcEmptyStateProps = { icon?: string; title: string; hint?: string; action?: ReactNode };

export function HcEmptyState({ icon = 'inbox', title, hint, action }: HcEmptyStateProps) {
  return (
    <section className="flex flex-col items-center gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface p-hc-xl text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-hc-neutral-subtle text-hc-text-secondary">
        <HcIcon name={icon} />
      </span>
      <h2 className="m-0 text-hc-title text-hc-text-primary">{title}</h2>
      {hint && <p className="m-0 max-w-md text-hc-body text-hc-text-secondary">{hint}</p>}
      {action}
    </section>
  );
}
