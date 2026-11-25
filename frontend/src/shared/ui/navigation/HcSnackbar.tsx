import { useTranslation } from 'react-i18next';
import { HcTextButton } from '../buttons/HcTextButton';
import { HcIcon } from '../display/HcIcon';

/** UI-26: transient toast / snackbar notification. NM-0192. */
type HcSnackbarProps = {
  open: boolean;
  message: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  floating?: boolean;
};

const TONE_META = {
  info: { bg: 'bg-hc-text-primary text-hc-on-primary', icon: 'info' },
  success: { bg: 'bg-hc-success text-hc-on-primary', icon: 'check_circle' },
  warning: { bg: 'bg-hc-warning text-hc-on-primary', icon: 'warning' },
  danger: { bg: 'bg-hc-danger text-hc-on-primary', icon: 'error' },
} as const;

export function HcSnackbar({
  open,
  message,
  tone = 'info',
  actionLabel,
  onAction,
  onClose,
  floating = false,
}: HcSnackbarProps) {
  const { t } = useTranslation();
  if (!open) return null;

  const meta = TONE_META[tone];
  const wrapperClass = floating
    ? 'fixed bottom-hc-lg left-1/2 z-50 -translate-x-1/2 px-hc-md w-full max-w-hc-modal'
    : 'w-full';

  return (
    <div className={wrapperClass}>
      <div
        role={tone === 'danger' ? 'alert' : 'status'}
        className={`hc-animate-in flex min-h-hc-touch items-center justify-between gap-hc-sm rounded-hc-sm px-hc-md py-hc-sm shadow-hc-elevated ${meta.bg}`}
      >
        <div className="flex min-w-0 items-center gap-hc-sm">
          <HcIcon name={meta.icon} dense />
          <span className="text-hc-body">{message}</span>
        </div>
        <div className="flex shrink-0 items-center gap-hc-xs">
          {actionLabel && onAction && (
            <HcTextButton onClick={onAction} className="text-hc-on-primary">
              {actionLabel}
            </HcTextButton>
          )}
          {onClose && (
            <button
              type="button"
              aria-label={t('ui.close')}
              onClick={onClose}
              className="flex size-hc-touch cursor-pointer items-center justify-center rounded-hc-sm text-hc-on-primary hover:opacity-80"
            >
              <HcIcon name="close" dense />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
