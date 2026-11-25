import type { ReactNode } from 'react';

/** UI-29c: standard data table cell with numeric tabular alignment and nowrap controls. NM-0196. */
type HcDataTableCellProps = {
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  numeric?: boolean;
  nowrap?: boolean;
  muted?: boolean;
};

const ALIGN_CLASSES = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const;

export function HcDataTableCell({
  children,
  align = 'left',
  numeric = false,
  nowrap = false,
  muted = false,
}: HcDataTableCellProps) {
  return (
    <td
      className={`border-b border-hc-border px-hc-md py-hc-ms text-hc-body ${
        muted ? 'text-hc-text-secondary' : 'text-hc-text-primary'
      } ${numeric ? 'hc-tabular font-semibold' : ''} ${nowrap ? 'whitespace-nowrap' : ''} ${ALIGN_CLASSES[align]}`}
    >
      {children}
    </td>
  );
}
