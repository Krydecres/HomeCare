import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppColors } from '@/shared/theme/tokens';
import { HcEmptyState } from '../states/HcEmptyState';
import {
  chartDefaults,
  createChartTooltipRenderer,
  renderChartCardHeader,
  resolveChartColor,
  type HcChartSeries,
} from './chartHelpers';

/** UI-29e: time-series line chart wrapper over Recharts styled exclusively with HomeCare tokens. NM-0194. */
type HcLineChartProps = {
  title: string;
  subtitle?: string;
  data: Record<string, string | number>[];
  xKey: string;
  series: HcChartSeries[];
  valueFormatter?: (value: number) => string;
  emptyText?: string;
  action?: ReactNode;
};

export function HcLineChart({
  title,
  subtitle,
  data,
  xKey,
  series,
  valueFormatter,
  emptyText,
  action,
}: HcLineChartProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <figure className="m-0 flex flex-col gap-hc-md rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
        {renderChartCardHeader(title, subtitle, action, series)}
        <HcEmptyState icon="show_chart" title={emptyText ?? t('ui.chartEmpty')} />
      </figure>
    );
  }

  return (
    <figure className="m-0 flex flex-col gap-hc-md rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
      {renderChartCardHeader(title, subtitle, action, series)}

      <div className="h-hc-chart w-full min-w-0" role="img" aria-label={title}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={240}
          initialDimension={chartDefaults.initialDimension}
        >
          <LineChart data={data} margin={chartDefaults.margin}>
            <CartesianGrid stroke={AppColors.border} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={chartDefaults.axisTick}
              axisLine={chartDefaults.axisLine}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              tick={chartDefaults.axisTick}
              axisLine={false}
              tickLine={false}
              width={64}
              tickFormatter={valueFormatter ? (v) => valueFormatter(Number(v)) : undefined}
            />
            <Tooltip content={createChartTooltipRenderer(series, valueFormatter)} />
            {series.map((item, idx) => {
              const stroke = resolveChartColor(item.colorToken, idx);
              return (
                <Line
                  key={item.dataKey}
                  type="monotone"
                  dataKey={item.dataKey}
                  name={item.label}
                  stroke={stroke}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: AppColors.surface, stroke, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: stroke, stroke: AppColors.surface, strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
