import { useTranslation } from 'react-i18next';
import { HcEmptyState } from '@/shared/ui/states/HcEmptyState';

/** Temporary content of a route until its feature owner codes the page from the approved wireframe. */
export function RoutePlaceholder({ wf }: { wf: string }) {
  const { t } = useTranslation();
  return (
    <HcEmptyState icon="construction" title={t('state.placeholderTitle')} hint={t('state.placeholderHint', { wf })} />
  );
}
