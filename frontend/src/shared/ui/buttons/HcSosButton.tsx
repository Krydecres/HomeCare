import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppColors } from '@/shared/theme/tokens';

/**
 * UI-21: 64×64 floating red SOS button. Requires pressing and holding for 3 seconds (holdMs) to prevent accidental
 * triggers during active shifts; supports both pointer and keyboard (Space / Enter) hold (UI-60, NM-0188).
 */
type HcSosButtonProps = {
  onActivate: () => void;
  floating?: boolean;
  holdMs?: number;
  label?: string;
  disabled?: boolean;
};

const RING_RADIUS = 28;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function HcSosButton({ onActivate, floating = true, holdMs = 3000, label, disabled = false }: HcSosButtonProps) {
  const { t } = useTranslation();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const stopHold = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setHolding(false);
    setProgress(0);
  }, []);

  const beginHold = useCallback(() => {
    if (disabled || timerRef.current !== null) return;
    setActivated(false);
    setHolding(true);
    startRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const ratio = Math.min(1, elapsed / holdMs);
      setProgress(ratio);
      if (ratio >= 1) {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setHolding(false);
        setProgress(0);
        setActivated(true);
        onActivate();
      }
    }, 50);
  }, [disabled, holdMs, onActivate]);

  useEffect(() => () => stopHold(), [stopHold]);

  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const remainingSec = Math.max(1, Math.ceil(((1 - progress) * holdMs) / 1000));

  return (
    <div
      className={
        floating
          ? 'fixed bottom-20 right-hc-md z-40 flex flex-col items-end gap-hc-xs md:bottom-hc-lg md:right-hc-lg'
          : 'inline-flex flex-col items-center gap-hc-xs'
      }
    >
      {holding && (
        <span
          role="status"
          aria-live="polite"
          className="hc-tabular rounded-hc-sm bg-hc-text-primary px-hc-sm py-hc-xs text-hc-caption font-semibold text-hc-on-primary shadow-hc-elevated"
        >
          {t('ui.sosHoldHint')} ({remainingSec}s)
        </span>
      )}
      <button
        type="button"
        disabled={disabled}
        aria-label={label ?? t('ui.sosHoldLabel')}
        aria-pressed={holding}
        onPointerDown={beginHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            beginHold();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            stopHold();
          }
        }}
        className="hc-pressable relative flex size-hc-sos cursor-pointer select-none items-center justify-center rounded-full bg-hc-danger text-hc-body font-bold tracking-wide text-hc-on-primary shadow-hc-elevated ring-4 ring-hc-danger-subtle hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          className="pointer-events-none absolute inset-0 size-full -rotate-90"
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r={RING_RADIUS} fill="none" stroke={AppColors.dangerSubtle} strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r={RING_RADIUS}
            fill="none"
            stroke={AppColors.onPrimary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="relative z-10">{activated ? '!' : 'SOS'}</span>
      </button>
    </div>
  );
}
