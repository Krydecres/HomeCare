import { DropdownMenu } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { HcSecondaryButton } from '../buttons/HcSecondaryButton';
import { HcIcon } from '../display/HcIcon';

/** UI-29c: nowrap right-aligned row action cell with primary button and optional Radix overflow menu. NM-0198. */
export type HcTableOverflowAction = {
  label: string;
  icon?: string;
  tone?: 'default' | 'danger';
  onClick: () => void;
};

type HcDataTableActionCellProps = {
  primaryLabel?: string;
  primaryIcon?: string;
  onPrimaryClick?: () => void;
  overflowActions?: HcTableOverflowAction[];
};

export function HcDataTableActionCell({
  primaryLabel,
  primaryIcon,
  onPrimaryClick,
  overflowActions = [],
}: HcDataTableActionCellProps) {
  const { t } = useTranslation();

  return (
    <td
      onClick={(e) => e.stopPropagation()}
      className="whitespace-nowrap border-b border-hc-border px-hc-md py-hc-ms text-right align-middle"
    >
      <div className="inline-flex items-center justify-end gap-hc-xs">
        {primaryLabel && onPrimaryClick && (
          <HcSecondaryButton dense icon={primaryIcon} onClick={onPrimaryClick}>
            {primaryLabel}
          </HcSecondaryButton>
        )}

        {overflowActions.length > 0 && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label={t('ui.moreActions')}
                className="hc-pressable inline-flex size-hc-touch cursor-pointer items-center justify-center rounded-hc-sm border border-hc-border bg-hc-surface text-hc-text-primary hover:bg-hc-neutral-subtle"
              >
                <HcIcon name="more_vert" dense />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-50 min-w-44 rounded-hc-sm border border-hc-border bg-hc-surface p-hc-xs shadow-hc-elevated"
              >
                {overflowActions.map((action) => (
                  <DropdownMenu.Item
                    key={action.label}
                    onSelect={action.onClick}
                    className={`flex min-h-hc-button-dense cursor-pointer items-center gap-hc-sm rounded-hc-sm px-hc-ms py-hc-sm text-hc-body outline-none hover:bg-hc-primary-subtle focus:bg-hc-primary-subtle ${
                      action.tone === 'danger' ? 'text-hc-danger' : 'text-hc-text-primary'
                    }`}
                  >
                    {action.icon && <HcIcon name={action.icon} dense />}
                    <span>{action.label}</span>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </td>
  );
}
