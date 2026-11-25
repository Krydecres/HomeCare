import { Dialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';

/** UI-29d: reusable header strip for right-hand detail drawers (also works standalone). NM-0196. */
type HcDetailDrawerHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  /** True when mounted inside HcDetailDrawer's Dialog.Root so Radix announces the visible heading once. */
  asDialogTitle?: boolean;
};

export function HcDetailDrawerHeader({
  title,
  subtitle,
  badge,
  actions,
  onClose,
  asDialogTitle = false,
}: HcDetailDrawerHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex items-start justify-between gap-hc-ms border-b border-hc-border bg-hc-surface px-hc-lg py-hc-md">
      <div className="flex min-w-0 flex-1 flex-col gap-hc-xs">
        <div className="flex flex-wrap items-center gap-hc-sm">
          {asDialogTitle ? (
            <Dialog.Title className="m-0 text-hc-title text-hc-text-primary">{title}</Dialog.Title>
          ) : (
            <h2 className="m-0 text-hc-title text-hc-text-primary">{title}</h2>
          )}
          {badge}
        </div>
        {subtitle &&
          (asDialogTitle ? (
            <Dialog.Description className="m-0 text-hc-caption text-hc-text-secondary">{subtitle}</Dialog.Description>
          ) : (
            <p className="m-0 text-hc-caption text-hc-text-secondary">{subtitle}</p>
          ))}
      </div>

      <div className="flex shrink-0 items-center gap-hc-xs">
        {actions}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t('ui.drawerCloseLabel')}
            className="hc-pressable inline-flex size-hc-touch cursor-pointer items-center justify-center rounded-hc-sm text-hc-text-secondary hover:bg-hc-neutral-subtle hover:text-hc-text-primary"
          >
            <HcIcon name="close" />
          </button>
        )}
      </div>
    </header>
  );
}
