import type { ReactNode } from 'react';

/** UI-25: section heading with optional description, count badge, and right-aligned action. NM-0191. */
type HcSectionHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
};

export function HcSectionHeader({ title, subtitle, badge, action }: HcSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-hc-sm">
      <div className="flex flex-col gap-hc-xs">
        <div className="flex items-center gap-hc-sm">
          <h2 className="text-hc-title text-hc-text-primary">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="text-hc-body text-hc-text-secondary">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
