import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HcSecondaryButton } from '../buttons/HcSecondaryButton';
import { HcEmptyState } from '../states/HcEmptyState';
import { HcErrorState } from '../states/HcErrorState';
import { HcLoading } from '../states/HcLoading';
import { HcDataTableHeaderCell } from './HcDataTableHeaderCell';

/** UI-29c & UI-15: sortable desktop table that automatically adapts into stacked cards below 768px. NM-0194. */
export type HcDataTableColumn<T> = {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  nowrap?: boolean;
  /** Renders a raw <td> node (e.g. HcDataTableCell, HcDataTableBadgeCell, HcDataTableActionCell) or plain content. */
  renderCell: (row: T) => ReactNode;
  /** Value rendered inside the mobile (< 768px) stacked card label-value row. */
  renderMobileValue?: (row: T) => ReactNode;
  hideOnMobile?: boolean;
  isRawTd?: boolean;
};

type HcDataTableProps<T> = {
  columns: HcDataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  caption?: string;
  loading?: boolean;
  error?: { title?: string; hint?: string; onRetry?: () => void };
  empty?: { icon?: string; title?: string; hint?: string; action?: ReactNode };
  sort?: { key: string; direction: 'asc' | 'desc' };
  onSortChange?: (key: string) => void;
  onRowClick?: (row: T) => void;
  selectedRowKey?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  mobileTitle?: (row: T) => ReactNode;
  mobileStatus?: (row: T) => ReactNode;
  mobileFooter?: (row: T) => ReactNode;
};

export function HcDataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  loading = false,
  error,
  empty,
  sort,
  onSortChange,
  onRowClick,
  selectedRowKey,
  pagination,
  mobileTitle,
  mobileStatus,
  mobileFooter,
}: HcDataTableProps<T>) {
  const { t } = useTranslation();

  if (loading) {
    return <HcLoading variant="table" lines={5} />;
  }

  if (error) {
    return <HcErrorState title={error.title} hint={error.hint} onRetry={error.onRetry} />;
  }

  if (rows.length === 0) {
    return (
      <HcEmptyState
        icon={empty?.icon ?? 'table_rows'}
        title={empty?.title ?? t('ui.noRows')}
        hint={empty?.hint}
        action={empty?.action}
      />
    );
  }

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-hc-ms">
      {/* Desktop (>= 768px): structured data table */}
      <div className="hidden overflow-x-auto rounded-hc-sm border border-hc-border bg-hc-surface shadow-hc-card md:block">
        <table className="w-full border-collapse">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <HcDataTableHeaderCell
                  key={col.key}
                  label={col.header}
                  align={col.align}
                  nowrap={col.nowrap ?? true}
                  sortable={col.sortable}
                  sortDirection={sort?.key === col.key ? sort.direction : null}
                  onSort={onSortChange ? () => onSortChange(col.key) : undefined}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowKey = getRowKey(row);
              const isSelected = selectedRowKey === rowKey;
              return (
                <tr
                  key={rowKey}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-selected={isSelected || undefined}
                  className={`transition-colors ${
                    isSelected ? 'bg-hc-primary-subtle' : 'hover:bg-hc-background'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => {
                    const node = col.renderCell(row);
                    if (col.isRawTd) {
                      return <FragmentCell key={col.key}>{node}</FragmentCell>;
                    }
                    return (
                      <td
                        key={col.key}
                        className={`border-b border-hc-border px-hc-md py-hc-ms text-hc-body text-hc-text-primary ${
                          col.nowrap ? 'whitespace-nowrap' : ''
                        } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                      >
                        {node}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile (< 768px, UI-15): stacked cards */}
      <div className="flex flex-col gap-hc-ms md:hidden">
        {rows.map((row) => {
          const rowKey = getRowKey(row);
          const isSelected = selectedRowKey === rowKey;
          const visibleCols = columns.filter((col) => !col.hideOnMobile && col.renderMobileValue);

          return (
            <article
              key={rowKey}
              className={`flex flex-col gap-hc-sm rounded-hc-sm border p-hc-md shadow-hc-card ${
                isSelected ? 'border-hc-primary bg-hc-primary-subtle' : 'border-hc-border bg-hc-surface'
              }`}
            >
              {(mobileTitle || mobileStatus) && (
                <div className="flex items-start justify-between gap-hc-sm">
                  {onRowClick && mobileTitle ? (
                    <button
                      type="button"
                      onClick={() => onRowClick(row)}
                      className="min-w-0 flex-1 cursor-pointer text-left text-hc-subtitle text-hc-text-primary hover:text-hc-primary"
                    >
                      {mobileTitle(row)}
                    </button>
                  ) : (
                    <div className="min-w-0 flex-1 text-hc-subtitle text-hc-text-primary">{mobileTitle?.(row)}</div>
                  )}
                  {mobileStatus?.(row)}
                </div>
              )}

              <dl className="m-0 flex flex-col gap-hc-xs border-t border-hc-border pt-hc-sm">
                {visibleCols.map((col) => (
                  <div key={col.key} className="flex items-baseline justify-between gap-hc-sm">
                    <dt className="text-hc-caption text-hc-text-secondary">{col.header}</dt>
                    <dd className="m-0 text-right text-hc-body text-hc-text-primary">{col.renderMobileValue?.(row)}</dd>
                  </div>
                ))}
              </dl>

              {mobileFooter && <div className="border-t border-hc-border pt-hc-sm">{mobileFooter(row)}</div>}
            </article>
          );
        })}
      </div>

      {pagination && totalPages > 1 && (
        <nav
          aria-label={t('ui.paginationSummary', {
            page: pagination.page,
            totalPages,
            total: pagination.total,
          })}
          className="flex flex-wrap items-center justify-between gap-hc-sm rounded-hc-sm border border-hc-border bg-hc-surface px-hc-md py-hc-sm"
        >
          <span className="hc-tabular text-hc-caption text-hc-text-secondary">
            {t('ui.paginationSummary', {
              page: pagination.page,
              totalPages,
              total: pagination.total,
            })}
          </span>
          <div className="flex items-center gap-hc-sm">
            <HcSecondaryButton
              dense
              icon="chevron_left"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              {t('ui.prevPage')}
            </HcSecondaryButton>
            <HcSecondaryButton
              dense
              icon="chevron_right"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              {t('ui.nextPage')}
            </HcSecondaryButton>
          </div>
        </nav>
      )}
    </div>
  );
}

function FragmentCell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
