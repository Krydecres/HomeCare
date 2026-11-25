import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';
import { HcSideNavItem } from './HcSideNavItem';

/**
 * UI-13 internal web sidebar (role dispatcher | admin | accountant | partnerOrg), 240px (UI-02).
 * UI-15: below 768px it becomes a slide-in menu opened from a top bar. Minimal version – TV2 owns UI kit.
 */
export type HcNavEntry = { to: string; icon: string; label: string; end?: boolean };
type HcSideNavProps = {
  role: 'dispatcher' | 'admin' | 'accountant' | 'partnerOrg';
  title: string;
  items: HcNavEntry[];
  footer?: ReactNode;
};

export function HcSideNav({ role, title, items, footer }: HcSideNavProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const list = (
    <nav aria-label={t('app.mainNavigation')} className="flex flex-1 flex-col gap-hc-xs" data-role={role}>
      {items.map((item) => (
        <HcSideNavItem key={item.to} {...item} onNavigate={() => setOpen(false)} />
      ))}
    </nav>
  );

  return (
    <>
      {/* < md: top bar + slide-in menu */}
      <div className="sticky top-0 z-20 flex h-hc-topbar items-center gap-hc-sm border-b border-hc-border bg-hc-surface px-hc-md md:hidden">
        <button
          type="button"
          className="flex size-hc-touch items-center justify-center rounded-hc-sm"
          aria-label={t('app.openMenu')}
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <HcIcon name="menu" />
        </button>
        <span className="text-hc-subtitle text-hc-primary">{title}</span>
      </div>
      {open && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          <aside className="flex w-hc-sidebar flex-col gap-hc-md bg-hc-surface p-hc-md">
            <button
              type="button"
              className="flex size-hc-touch items-center justify-center self-end rounded-hc-sm"
              aria-label={t('app.closeMenu')}
              onClick={() => setOpen(false)}
            >
              <HcIcon name="close" />
            </button>
            {list}
            {footer}
          </aside>
          <button
            type="button"
            aria-label={t('app.closeMenu')}
            className="flex-1 bg-hc-text-primary opacity-40"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      {/* ≥ md: fixed sidebar */}
      <aside className="sticky top-0 hidden h-screen w-hc-sidebar shrink-0 flex-col gap-hc-lg border-r border-hc-border bg-hc-surface p-hc-md md:flex">
        <div className="flex items-center gap-hc-sm px-hc-ms">
          <HcIcon name="home_health" className="text-hc-primary" />
          <span className="text-hc-subtitle text-hc-primary">{title}</span>
        </div>
        {list}
        {footer}
      </aside>
    </>
  );
}
