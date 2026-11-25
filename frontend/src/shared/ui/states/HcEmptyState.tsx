import type { ReactNode } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-30 "Trống": icon + title + hint + action. Minimal version – TV2 owns UI kit (US-15-012). */
type HcEmptyStateProps = { icon?: string; title: string; hint?: string; action?: ReactNode };

export function HcEmptyState({ icon = 'inbox', title, hint, action }: HcEmptyStateProps) {
  return (
    <section className="flex flex-col items-center gap-hc-ms p-hc-xl text-center">
      <HcIcon name={icon} className="text-hc-text-secondary" />
      <h2 className="text-hc-title text-hc-text-primary">{title}</h2>
      {hint && <p className="text-hc-body text-hc-text-secondary">{hint}</p>}
      {action}
    </section>
  );
}
