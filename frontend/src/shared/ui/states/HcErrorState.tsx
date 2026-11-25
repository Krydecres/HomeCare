import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HcSecondaryButton } from '../buttons/HcSecondaryButton';
import { HcIcon } from '../display/HcIcon';

/** UI-30 "Lỗi" with a retry button. NM-0194. */
type HcErrorStateProps = { title?: string; hint?: string; onRetry?: () => void; action?: ReactNode };

export function HcErrorState({ title, hint, onRetry, action }: HcErrorStateProps) {
  const { t } = useTranslation();
  return (
    <section
      role="alert"
      className="flex flex-col items-center gap-hc-ms rounded-hc-sm border border-hc-danger bg-hc-danger-subtle p-hc-xl text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-hc-surface text-hc-danger shadow-hc-card">
        <HcIcon name="error" />
      </span>
      <h2 className="m-0 text-hc-title text-hc-text-primary">{title ?? t('state.errorTitle')}</h2>
      <p className="m-0 max-w-md text-hc-body text-hc-text-secondary">{hint ?? t('state.errorHint')}</p>
      {onRetry && <HcSecondaryButton onClick={onRetry}>{t('state.retry')}</HcSecondaryButton>}
      {action}
    </section>
  );
}
