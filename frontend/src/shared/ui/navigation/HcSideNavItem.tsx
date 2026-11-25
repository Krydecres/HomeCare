import { NavLink } from 'react-router';
import { HcIcon } from '../display/HcIcon';

/** UI-29b sidebar item (Default / Active). Minimal version – TV2 owns UI kit (US-15-012). */
type HcSideNavItemProps = { to: string; icon: string; label: string; end?: boolean; onNavigate?: () => void };

export function HcSideNavItem({ to, icon, label, end, onNavigate }: HcSideNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex min-h-hc-touch items-center gap-hc-ms rounded-hc-sm px-hc-ms text-hc-body ${
          isActive
            ? 'bg-hc-primary-subtle font-semibold text-hc-primary'
            : 'text-hc-text-primary hover:bg-hc-neutral-subtle'
        }`
      }
    >
      <HcIcon name={icon} dense />
      <span>{label}</span>
    </NavLink>
  );
}
