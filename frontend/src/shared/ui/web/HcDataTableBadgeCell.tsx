import type { HcStatusTone } from '@/shared/lib/statusMeta';
import { HcStatusBadge } from '../display/HcStatusBadge';

/** UI-29c: nowrap status-badge table cell so status pills never wrap mid-word. NM-0198. */
type HcDataTableBadgeCellProps = {
  label: string;
  tone?: HcStatusTone;
  icon?: string;
  sublabel?: string;
};

export function HcDataTableBadgeCell({ label, tone = 'neutral', icon, sublabel }: HcDataTableBadgeCellProps) {
  return (
    <td className="whitespace-nowrap border-b border-hc-border px-hc-md py-hc-ms align-middle">
      <div className="inline-flex flex-col items-start gap-hc-xs">
        <HcStatusBadge label={label} tone={tone} icon={icon} />
        {sublabel && <span className="text-hc-caption text-hc-text-secondary">{sublabel}</span>}
      </div>
    </td>
  );
}
