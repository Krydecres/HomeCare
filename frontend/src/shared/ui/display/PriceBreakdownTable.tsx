import { useTranslation } from 'react-i18next';
import { AppFormatters } from '@/shared/theme/AppFormatters';

/** UI-25 / UI-23b: transparent itemized pricing breakdown using integer VND via AppFormatters. NM-0191. */
export type PriceBreakdownItem = {
  label: string;
  note?: string;
  amountVnd: number;
  tone?: 'default' | 'discount' | 'surcharge';
};

type PriceBreakdownTableProps = {
  items: PriceBreakdownItem[];
  totalVnd: number;
  totalLabel?: string;
  policyNote?: string;
};

const AMOUNT_TONE = {
  default: 'text-hc-text-primary',
  discount: 'text-hc-success',
  surcharge: 'text-hc-warning',
} as const;

export function PriceBreakdownTable({ items, totalVnd, totalLabel, policyNote }: PriceBreakdownTableProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
      <dl className="m-0 flex flex-col gap-hc-sm">
        {items.map((item, idx) => (
          <div key={`${item.label}-${idx}`} className="flex items-start justify-between gap-hc-md">
            <dt className="flex flex-col">
              <span className="text-hc-body text-hc-text-primary">{item.label}</span>
              {item.note && <span className="text-hc-caption text-hc-text-secondary">{item.note}</span>}
            </dt>
            <dd className={`hc-tabular m-0 shrink-0 font-semibold ${AMOUNT_TONE[item.tone ?? 'default']}`}>
              {item.amountVnd < 0
                ? `−${AppFormatters.money(Math.abs(item.amountVnd))}`
                : AppFormatters.money(item.amountVnd)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between gap-hc-md border-t border-hc-border pt-hc-ms">
        <span className="text-hc-subtitle text-hc-text-primary">{totalLabel ?? t('ui.totalAmount')}</span>
        <span className="hc-tabular text-hc-title font-bold text-hc-primary">{AppFormatters.money(totalVnd)}</span>
      </div>

      {policyNote && (
        <p className="m-0 rounded-hc-sm bg-hc-neutral-subtle px-hc-ms py-hc-sm text-hc-caption text-hc-text-secondary">
          {policyNote}
        </p>
      )}
    </section>
  );
}
