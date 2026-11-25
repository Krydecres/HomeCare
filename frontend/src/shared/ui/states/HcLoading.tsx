import { useTranslation } from 'react-i18next';

/** UI-30 "Đang tải" (skeleton). Minimal version – TV2 owns UI kit (US-15-012). */
export function HcLoading({ lines = 3 }: { lines?: number }) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-hc-ms p-hc-lg">
      <span className="sr-only">{t('state.loading')}</span>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-hc-md animate-pulse rounded-hc-sm bg-hc-neutral-subtle" />
      ))}
    </div>
  );
}
