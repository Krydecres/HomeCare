import { Dialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { HcDangerButton } from '../buttons/HcDangerButton';
import { HcPrimaryButton } from '../buttons/HcPrimaryButton';
import { HcSecondaryButton } from '../buttons/HcSecondaryButton';
import { HcIcon } from '../display/HcIcon';

/** UI-26: accessible confirmation dialog for irreversible or payment actions. Built on Radix Dialog. NM-0192. */
type HcConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
};

export function HcConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  loading = false,
  onConfirm,
}: HcConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-hc-text-primary opacity-45" />
        <Dialog.Content className="hc-animate-in fixed left-1/2 top-1/2 z-50 flex w-full max-w-hc-modal -translate-x-1/2 -translate-y-1/2 flex-col gap-hc-md rounded-hc-md border border-hc-border bg-hc-surface p-hc-lg shadow-hc-elevated outline-none">
          <div className="flex items-start gap-hc-ms">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                tone === 'danger' ? 'bg-hc-danger-subtle text-hc-danger' : 'bg-hc-primary-subtle text-hc-primary'
              }`}
            >
              <HcIcon name={tone === 'danger' ? 'warning' : 'help'} dense />
            </span>
            <div className="flex flex-1 flex-col gap-hc-xs">
              <Dialog.Title className="m-0 text-hc-title text-hc-text-primary">{title}</Dialog.Title>
              <Dialog.Description className="m-0 text-hc-body text-hc-text-secondary">{description}</Dialog.Description>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-hc-sm pt-hc-xs">
            <Dialog.Close asChild>
              <HcSecondaryButton dense disabled={loading}>
                {cancelLabel ?? t('ui.cancel')}
              </HcSecondaryButton>
            </Dialog.Close>
            {tone === 'danger' ? (
              <HcDangerButton dense loading={loading} onClick={onConfirm}>
                {confirmLabel ?? t('ui.confirm')}
              </HcDangerButton>
            ) : (
              <HcPrimaryButton dense loading={loading} onClick={onConfirm}>
                {confirmLabel ?? t('ui.confirm')}
              </HcPrimaryButton>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
