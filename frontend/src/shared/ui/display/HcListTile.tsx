import type { ReactNode } from 'react';
import { HcIcon } from './HcIcon';

/** UI-25 / UI-23b: structured list row with leading icon/avatar, title, subtitle, and trailing slot. NM-0191. */
type HcListTileProps = {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  chevron?: boolean;
};

export function HcListTile({ leading, title, subtitle, trailing, onClick, chevron = false }: HcListTileProps) {
  const content = (
    <>
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-hc-body font-semibold text-hc-text-primary">{title}</span>
        {subtitle && <span className="truncate text-hc-caption text-hc-text-secondary">{subtitle}</span>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
      {chevron && <HcIcon name="chevron_right" dense className="text-hc-text-secondary" />}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="hc-pressable flex min-h-hc-touch w-full cursor-pointer items-center gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface px-hc-md py-hc-ms text-left hover:border-hc-primary hover:bg-hc-primary-subtle"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex min-h-hc-touch w-full items-center gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface px-hc-md py-hc-ms">
      {content}
    </div>
  );
}
