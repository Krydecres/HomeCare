import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { HcIcon } from '../display/HcIcon';
import type { HcNavEntry } from './HcSideNav';

/**
 * UI-10 / UI-11 top bar for customer and caregiver: logo (+ mode label, UI-17) | menu | bell | account.
 * UI-15: below 768px the menu becomes a bottom bar with 4 items. Minimal version – TV2 owns UI kit (US-15-012).
 */
type HcTopNavProps = {
  role: 'customer' | 'caregiver';
  modeLabel?: string;
  items: HcNavEntry[];
  actions?: ReactNode;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-hc-touch items-center gap-hc-xs rounded-hc-sm px-hc-ms text-hc-body ${
    isActive ? 'font-semibold text-hc-primary' : 'text-hc-text-secondary hover:text-hc-text-primary'
  }`;

export function HcTopNav({ role, modeLabel, items, actions }: HcTopNavProps) {
  const { t } = useTranslation();
  return (
    <>
      <header
        data-role={role}
        className="sticky top-0 z-20 flex h-hc-topbar items-center gap-hc-lg border-b border-hc-border bg-hc-surface px-hc-md md:px-hc-xl"
      >
        <div className="flex items-center gap-hc-sm">
          <HcIcon name="home_health" className="text-hc-primary" />
          <span className="text-hc-title text-hc-primary">{t('app.name')}</span>
          {modeLabel && (
            <span className="rounded-hc-sm bg-hc-primary-subtle px-hc-sm text-hc-caption text-hc-primary">
              {modeLabel}
            </span>
          )}
        </div>
        <nav aria-label={t('app.mainNavigation')} className="hidden flex-1 items-center gap-hc-xs md:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-hc-sm">{actions}</div>
      </header>

      {/* < md: bottom bar, 4 items */}
      <nav
        aria-label={t('app.mainNavigation')}
        className="fixed inset-x-0 bottom-0 z-20 flex h-hc-topbar items-stretch border-t border-hc-border bg-hc-surface md:hidden"
      >
        {items.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center text-hc-caption ${
                isActive ? 'text-hc-primary' : 'text-hc-text-secondary'
              }`
            }
          >
            <HcIcon name={item.icon} dense />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
