import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';

/** UI-14 / UI-23b: multi-step wizard progress bar ("Bước X/Y"). NM-0192. */
type HcStepperProps = {
  steps: string[];
  currentStep: number;
};

export function HcStepper({ steps, currentStep }: HcStepperProps) {
  const { t } = useTranslation();
  const safeCurrent = Math.max(1, Math.min(steps.length, currentStep));
  const currentLabel = steps[safeCurrent - 1] ?? '';

  return (
    <nav
      aria-label={t('ui.stepProgress', { current: safeCurrent, total: steps.length })}
      className="flex flex-col gap-hc-sm"
    >
      <div className="flex items-center justify-between gap-hc-sm">
        <span className="hc-tabular text-hc-caption font-semibold text-hc-primary">
          {t('ui.stepProgress', { current: safeCurrent, total: steps.length })}
        </span>
        <span className="text-hc-body font-semibold text-hc-text-primary">{currentLabel}</span>
      </div>

      {/* Mobile: segmented bar */}
      <div className="flex gap-hc-xs md:hidden" aria-hidden="true">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const activeOrDone = stepNum <= safeCurrent;
          return (
            <span
              key={label}
              className={`h-1.5 flex-1 rounded-full ${activeOrDone ? 'bg-hc-primary' : 'bg-hc-border'}`}
            />
          );
        })}
      </div>

      {/* Desktop: step nodes + connectors */}
      <ol className="m-0 hidden list-none items-center gap-hc-sm p-0 md:flex">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const done = stepNum < safeCurrent;
          const current = stepNum === safeCurrent;
          return (
            <li key={label} className="flex flex-1 items-center gap-hc-sm last:flex-none">
              <div className="flex items-center gap-hc-xs">
                <span
                  aria-current={current ? 'step' : undefined}
                  className={`hc-tabular flex size-8 shrink-0 items-center justify-center rounded-full border text-hc-caption font-bold ${
                    done
                      ? 'border-hc-primary bg-hc-primary text-hc-on-primary'
                      : current
                        ? 'border-hc-primary bg-hc-primary-subtle text-hc-primary'
                        : 'border-hc-border bg-hc-surface text-hc-text-secondary'
                  }`}
                >
                  {done ? <HcIcon name="check" dense /> : stepNum}
                </span>
                <span
                  className={`whitespace-nowrap text-hc-caption ${
                    current ? 'font-semibold text-hc-primary' : 'text-hc-text-secondary'
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <span aria-hidden="true" className={`h-0.5 flex-1 ${done ? 'bg-hc-primary' : 'bg-hc-border'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
