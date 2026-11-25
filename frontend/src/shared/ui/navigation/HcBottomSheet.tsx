import { Dialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';

/**
 * UI-26 / UI-23b: quick-selection overlay. Slides from bottom on mobile (< 768px) and displays as a centered
 * popover/modal card on desktop (>= 768px). Built on Radix Dialog. NM-0192.
 */
type HcBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function HcBottomSheet({ open, onOpenChange, title, description, children }: HcBottomSheetProps) {
  const { t } = useTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-hc-text-primary opacity-45" />
        <Dialog.Content className="hc-sheet-panel hc-animate-in fixed inset-x-0 bottom-0 z-50 flex flex-col gap-hc-md overflow-y-auto rounded-t-hc-md border border-hc-border bg-hc-surface p-hc-lg shadow-hc-elevated outline-none md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-hc-modal md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-hc-md">
          <div className="mx-auto h-1 w-10 rounded-full bg-hc-border md:hidden" aria-hidden="true" />
          <div className="flex items-start justify-between gap-hc-sm">
            <div className="flex flex-col gap-hc-xs">
              <Dialog.Title className="m-0 text-hc-title text-hc-text-primary">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="m-0 text-hc-body text-hc-text-secondary">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t('ui.close')}
                className="flex size-hc-touch shrink-0 cursor-pointer items-center justify-center rounded-hc-sm text-hc-text-secondary hover:bg-hc-neutral-subtle hover:text-hc-text-primary"
              >
                <HcIcon name="close" dense />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
