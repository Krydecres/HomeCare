import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { HcIcon } from '../display/HcIcon';

/** UI-14 / UI-29b: page title bar with optional back link/handler, badge, subtitle, and right actions. NM-0196. */
type HcPageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  backTo?: string;
  onBack?: () => void;
  actions?: ReactNode;
};

export function HcPageHeader({ title, subtitle, badge, backTo, onBack, actions }: HcPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex flex-wrap items-start justify-between gap-hc-md border-b border-hc-border pb-hc-md">
      <div className="flex min-w-0 items-start gap-hc-sm">
        {backTo ? (
          <Link
            to={backTo}
            aria-label={t('ui.back')}
            className="hc-pressable flex size-hc-touch shrink-0 items-center justify-center rounded-hc-sm border border-hc-border bg-hc-surface text-hc-text-primary hover:border-hc-primary hover:text-hc-primary"
          >
            <HcIcon name="arrow_back" dense />
          </Link>
        ) : (
          onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={t('ui.back')}
              className="hc-pressable flex size-hc-touch shrink-0 cursor-pointer items-center justify-center rounded-hc-sm border border-hc-border bg-hc-surface text-hc-text-primary hover:border-hc-primary hover:text-hc-primary"
            >
              <HcIcon name="arrow_back" dense />
            </button>
          )
        )}
        <div className="flex min-w-0 flex-col gap-hc-xs">
          <div className="flex flex-wrap items-center gap-hc-sm">
            <h1 className="m-0 text-hc-display text-hc-text-primary">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="m-0 text-hc-body text-hc-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-hc-sm">{actions}</div>}
    </header>
  );
}
