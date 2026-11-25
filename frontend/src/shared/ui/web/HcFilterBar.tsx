import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HcTextButton } from '../buttons/HcTextButton';
import { HcIcon } from '../display/HcIcon';

/** UI-29b: web search + filter bar wrapping cleanly down to 390px without horizontal overflow. NM-0194. */
type HcFilterBarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  activeFilterCount?: number;
  onReset?: () => void;
  resultSummary?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function HcFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  activeFilterCount = 0,
  onReset,
  resultSummary,
  actions,
  children,
}: HcFilterBarProps) {
  const { t } = useTranslation();
  const hasActiveFilters = Boolean(search?.trim()) || activeFilterCount > 0;

  return (
    <section
      aria-label={t('ui.searchPlaceholder')}
      className="flex flex-col gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card"
    >
      <div className="flex flex-col gap-hc-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-hc-sm md:flex-row md:flex-wrap md:items-end">
          {onSearchChange && (
            <div className="flex min-w-0 flex-1 flex-col gap-hc-xs md:min-w-60">
              {searchLabel && (
                <label htmlFor="hc-filter-search" className="text-hc-caption font-semibold text-hc-text-primary">
                  {searchLabel}
                </label>
              )}
              <div className="flex min-h-hc-touch items-center gap-hc-sm rounded-hc-sm border border-hc-border bg-hc-surface px-hc-ms focus-within:border-hc-primary">
                <span aria-hidden="true" className="text-hc-text-secondary">
                  <HcIcon name="search" dense />
                </span>
                <input
                  id="hc-filter-search"
                  type="search"
                  value={search ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder ?? t('ui.searchPlaceholder')}
                  className="min-w-0 flex-1 bg-transparent py-hc-sm text-hc-body text-hc-text-primary placeholder:text-hc-text-secondary focus:outline-none"
                />
              </div>
            </div>
          )}

          {children}
        </div>

        {(hasActiveFilters || actions || resultSummary) && (
          <div className="flex flex-wrap items-center justify-between gap-hc-sm lg:justify-end">
            {resultSummary && (
              <span className="hc-tabular text-hc-caption font-medium text-hc-text-secondary">{resultSummary}</span>
            )}
            {hasActiveFilters && onReset && (
              <HcTextButton icon="filter_alt_off" onClick={onReset}>
                {t('ui.clearFilters')}
              </HcTextButton>
            )}
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
