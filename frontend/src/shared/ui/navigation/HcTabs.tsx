import { Tabs } from 'radix-ui';
import type { ReactNode } from 'react';
import { HcIcon } from '../display/HcIcon';

/** UI-29b: horizontal underline tabs built on Radix Tabs with keyboard navigation. NM-0196. */
export type HcTabItem = {
  value: string;
  label: string;
  icon?: string;
  count?: number;
  content: ReactNode;
};

type HcTabsProps = {
  items: HcTabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function HcTabs({ items, value, defaultValue, onValueChange }: HcTabsProps) {
  const initial = defaultValue ?? items[0]?.value;

  return (
    <Tabs.Root value={value} defaultValue={value ? undefined : initial} onValueChange={onValueChange}>
      <Tabs.List className="flex overflow-x-auto border-b border-hc-border">
        {items.map((item) => (
          <Tabs.Trigger
            key={item.value}
            value={item.value}
            className="flex min-h-hc-touch shrink-0 cursor-pointer items-center gap-hc-xs whitespace-nowrap border-b-2 border-transparent px-hc-md text-hc-body font-semibold text-hc-text-secondary transition-colors hover:text-hc-text-primary aria-selected:border-hc-primary aria-selected:text-hc-primary"
          >
            {item.icon && <HcIcon name={item.icon} dense />}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className="hc-tabular rounded-full bg-hc-neutral-subtle px-hc-sm text-hc-caption text-hc-text-primary">
                {item.count}
              </span>
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {items.map((item) => (
        <Tabs.Content key={item.value} value={item.value} className="pt-hc-md outline-none">
          {item.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
