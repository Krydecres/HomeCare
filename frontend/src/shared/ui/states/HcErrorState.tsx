import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HcSecondaryButton } from '../buttons/HcSecondaryButton';
import { HcIcon } from '../display/HcIcon';

/** UI-30 "Lỗi" with a retry button. Minimal version – TV2 owns UI kit (US-15-012). */
type HcErrorStateProps = { title?: string; hint?: string; onRetry?: () => void; action?: ReactNode };

export function HcErrorState({ title, hint, onRetry, action }: HcErrorStateProps) {
  const { t } = useTranslation();
  return (
    <section role="alert" className="flex flex-col items-center gap-hc-ms p-hc-xl text-center">
      <HcIcon name="error" className="text-hc-danger" />
      <h2 className="text-hc-title text-hc-text-primary">{title ?? t('state.errorTitle')}</h2>
      <p className="text-hc-body text-hc-text-secondary">{hint ?? t('state.errorHint')}</p>
      {onRetry && <HcSecondaryButton onClick={onRetry}>{t('state.retry')}</HcSecondaryButton>}
      {action}
    </section>
  );
}
