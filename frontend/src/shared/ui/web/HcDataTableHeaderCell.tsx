import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';

/** UI-29c: accessible sortable table column header cell. NM-0196. */
type HcDataTableHeaderCellProps = {
  label: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  nowrap?: boolean;
};

const ALIGN_CLASSES = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const;

export function HcDataTableHeaderCell({
  label,
  align = 'left',
  sortable = false,
  sortDirection = null,
  onSort,
  nowrap = true,
}: HcDataTableHeaderCellProps) {
  const { t } = useTranslation();

  const ariaSort = sortable
    ? sortDirection === 'asc'
      ? 'ascending'
      : sortDirection === 'desc'
        ? 'descending'
        : 'none'
    : undefined;

  const sortIcon =
    sortDirection === 'asc' ? 'arrow_upward' : sortDirection === 'desc' ? 'arrow_downward' : 'unfold_more';

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`border-b border-hc-border bg-hc-background px-hc-md py-hc-sm text-hc-caption font-semibold text-hc-text-secondary ${
        nowrap ? 'whitespace-nowrap' : ''
      } ${ALIGN_CLASSES[align]}`}
    >
      {sortable && onSort ? (
        <button
          type="button"
          onClick={onSort}
          title={sortDirection === 'asc' ? t('ui.sortDesc') : t('ui.sortAsc')}
          className={`hc-pressable inline-flex min-h-hc-button-dense cursor-pointer items-center gap-hc-xs rounded-hc-sm px-hc-xs text-hc-caption font-semibold hover:bg-hc-neutral-subtle hover:text-hc-text-primary ${
            sortDirection ? 'text-hc-primary' : 'text-hc-text-secondary'
          }`}
        >
          <span>{label}</span>
          <HcIcon name={sortIcon} dense />
        </button>
      ) : (
        <span>{label}</span>
      )}
    </th>
  );
}
