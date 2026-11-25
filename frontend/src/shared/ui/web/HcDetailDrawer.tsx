import { Dialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { HcDetailDrawerHeader } from './HcDetailDrawerHeader';

/** UI-29d & UI-15: 480px slide-over drawer on desktop/tablet; full-screen sheet on < 768px. NM-0194. */
type HcDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function HcDetailDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  badge,
  headerActions,
  footer,
  children,
}: HcDetailDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-hc-text-primary opacity-40" />
        <Dialog.Content className="hc-drawer-panel hc-animate-in fixed inset-0 z-50 flex flex-col bg-hc-surface shadow-hc-elevated outline-none md:inset-y-0 md:left-auto md:right-0 md:w-full md:max-w-hc-drawer md:border-l md:border-hc-border">
          {!subtitle && <Dialog.Description className="sr-only">{title}</Dialog.Description>}

          <HcDetailDrawerHeader
            title={title}
            subtitle={subtitle}
            badge={badge}
            actions={headerActions}
            onClose={() => onOpenChange(false)}
            asDialogTitle
          />

          <div className="flex-1 overflow-y-auto p-hc-lg">{children}</div>

          {footer && (
            <footer className="flex flex-wrap items-center justify-end gap-hc-sm border-t border-hc-border bg-hc-background px-hc-lg py-hc-md">
              {footer}
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
