/**
 * Design tokens for TypeScript code (charts, maps…) – NM-0187, NM-0197. Values mirror theme.css; in components prefer
 * the Tailwind classes (bg-hc-primary, p-hc-md…). Colors reference the CSS variables so there is one source of truth.
 */
export const AppColors = {
  primary: 'var(--hc-color-primary)',
  onPrimary: 'var(--hc-color-on-primary)',
  background: 'var(--hc-color-background)',
  surface: 'var(--hc-color-surface)',
  textPrimary: 'var(--hc-color-text-primary)',
  textSecondary: 'var(--hc-color-text-secondary)',
  border: 'var(--hc-color-border)',
  success: 'var(--hc-color-success)',
  warning: 'var(--hc-color-warning)',
  danger: 'var(--hc-color-danger)',
  info: 'var(--hc-color-info)',
  primarySubtle: 'var(--hc-color-primary-subtle)',
  neutralSubtle: 'var(--hc-color-neutral-subtle)',
  infoSubtle: 'var(--hc-color-info-subtle)',
  successSubtle: 'var(--hc-color-success-subtle)',
  warningSubtle: 'var(--hc-color-warning-subtle)',
  dangerSubtle: 'var(--hc-color-danger-subtle)',
} as const;

/** UI-01 4pt grid (px). */
export const AppSpacing = { xs: 4, sm: 8, ms: 12, md: 16, lg: 24, xl: 32 } as const;

/** UI-06 (px). */
export const AppRadius = { sm: 8, md: 12 } as const;

/** UI-15 (px). */
export const AppBreakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;

/** UI-04: Tailwind class per text style. */
export const AppTextStyles = {
  display: 'text-hc-display',
  title: 'text-hc-title',
  subtitle: 'text-hc-subtitle',
  body: 'text-hc-body',
  caption: 'text-hc-caption',
} as const;
