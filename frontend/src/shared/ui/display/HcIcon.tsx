/** UI-05: Material Symbols Rounded only, 24px (20 in dense lists). Decorative unless `label` is given (UI-60). */
type HcIconProps = { name: string; label?: string; dense?: boolean; className?: string };

export function HcIcon({ name, label, dense = false, className = '' }: HcIconProps) {
  return (
    <span
      className={`material-symbols-rounded select-none leading-none ${dense ? 'text-hc-subtitle' : 'text-hc-display'} ${className}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  );
}
