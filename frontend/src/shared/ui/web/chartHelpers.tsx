import type { ReactNode } from 'react';
import type { TooltipContentProps } from 'recharts';
import { AppColors } from '@/shared/theme/tokens';

/** Shared token mapping and accessible header/tooltip helpers for HcLineChart & HcBarChart. */
export type HcChartTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export type HcChartSeries = {
  dataKey: string;
  label: string;
  colorToken?: HcChartTone;
  stacked?: boolean;
};

const TONE_CSS_VARS: Record<HcChartTone, string> = {
  primary: AppColors.primary,
  info: AppColors.info,
  success: AppColors.success,
  warning: AppColors.warning,
  danger: AppColors.danger,
};

const TONE_DOT_CLASSES: Record<HcChartTone, string> = {
  primary: 'bg-hc-primary',
  info: 'bg-hc-info',
  success: 'bg-hc-success',
  warning: 'bg-hc-warning',
  danger: 'bg-hc-danger',
};

const DEFAULT_ORDER: HcChartTone[] = ['primary', 'info', 'success', 'warning', 'danger'];

export const resolveChartColor = (tone: HcChartTone | undefined, index: number): string =>
  TONE_CSS_VARS[tone ?? DEFAULT_ORDER[index % DEFAULT_ORDER.length] ?? 'primary'];

export const resolveChartDotClass = (tone: HcChartTone | undefined, index: number): string =>
  TONE_DOT_CLASSES[tone ?? DEFAULT_ORDER[index % DEFAULT_ORDER.length] ?? 'primary'];

export const chartDefaults = {
  initialDimension: { width: 560, height: 240 },
  margin: { top: 8, right: 12, left: 0, bottom: 4 },
  axisTick: { fill: AppColors.textSecondary, fontSize: 12 },
  axisLine: { stroke: AppColors.border },
};

export function createChartTooltipRenderer(
  seriesList: HcChartSeries[],
  valueFormatter?: (value: number) => string,
): (props: TooltipContentProps) => ReactNode {
  return function renderTooltip({ active, label, payload }) {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="rounded-hc-sm border border-hc-border bg-hc-surface px-hc-ms py-hc-sm shadow-hc-elevated">
        {label !== undefined && (
          <p className="m-0 pb-hc-xs text-hc-caption font-semibold text-hc-text-primary">{String(label)}</p>
        )}
        <div className="flex flex-col gap-hc-xs">
          {payload.map((entry, idx) => {
            const matchedIdx = seriesList.findIndex((s) => s.dataKey === entry.dataKey);
            const resolvedIdx = matchedIdx >= 0 ? matchedIdx : idx;
            const series = seriesList[resolvedIdx];
            const numericVal = typeof entry.value === 'number' ? entry.value : Number(entry.value ?? 0);
            const formatted =
              valueFormatter && !Number.isNaN(numericVal) ? valueFormatter(numericVal) : String(entry.value ?? '');

            return (
              <div
                key={`${String(entry.dataKey)}-${idx}`}
                className="flex items-center justify-between gap-hc-md text-hc-caption"
              >
                <span className="inline-flex items-center gap-hc-xs text-hc-text-secondary">
                  <span
                    aria-hidden="true"
                    className={`size-hc-badge-dot rounded-full ${resolveChartDotClass(series?.colorToken, resolvedIdx)}`}
                  />
                  <span>{series?.label ?? entry.name}</span>
                </span>
                <span className="hc-tabular font-semibold text-hc-text-primary">{formatted}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
}

export function renderChartCardHeader(
  title: string,
  subtitle: string | undefined,
  action: ReactNode,
  series: HcChartSeries[],
) {
  return (
    <div className="flex flex-col gap-hc-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-hc-xs">
        <h3 className="m-0 text-hc-subtitle text-hc-text-primary">{title}</h3>
        {subtitle && <p className="m-0 text-hc-caption text-hc-text-secondary">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-hc-sm">
        <ul className="m-0 flex list-none flex-wrap items-center gap-hc-ms p-0" aria-label={title}>
          {series.map((item, idx) => (
            <li
              key={item.dataKey}
              className="inline-flex items-center gap-hc-xs text-hc-caption text-hc-text-secondary"
            >
              <span
                aria-hidden="true"
                className={`size-hc-badge-dot rounded-full ${resolveChartDotClass(item.colorToken, idx)}`}
              />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        {action}
      </div>
    </div>
  );
}
