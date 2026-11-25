import { useTranslation } from 'react-i18next';

/** UI-30 "Đang tải" (skeleton) supporting rows, card grid, or table previews. NM-0194. */
type HcLoadingProps = {
  lines?: number;
  variant?: 'rows' | 'cards' | 'table';
};

export function HcLoading({ lines = 3, variant = 'rows' }: HcLoadingProps) {
  const { t } = useTranslation();

  if (variant === 'cards') {
    return (
      <div role="status" aria-live="polite" className="grid grid-cols-1 gap-hc-md md:grid-cols-2 lg:grid-cols-3">
        <span className="sr-only">{t('state.loading')}</span>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="flex flex-col gap-hc-sm rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md">
            <div className="h-hc-md w-2/3 animate-pulse rounded-hc-sm bg-hc-neutral-subtle" />
            <div className="h-hc-md w-full animate-pulse rounded-hc-sm bg-hc-neutral-subtle" />
            <div className="h-hc-md w-1/2 animate-pulse rounded-hc-sm bg-hc-neutral-subtle" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-hc-xs rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md"
      >
        <span className="sr-only">{t('state.loading')}</span>
        <div className="h-hc-button-dense w-full animate-pulse rounded-hc-sm bg-hc-primary-subtle" />
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="h-hc-touch w-full animate-pulse rounded-hc-sm bg-hc-neutral-subtle" />
        ))}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-hc-ms p-hc-lg">
      <span className="sr-only">{t('state.loading')}</span>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-hc-md animate-pulse rounded-hc-sm bg-hc-neutral-subtle" />
      ))}
    </div>
  );
}
