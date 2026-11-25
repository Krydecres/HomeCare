import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';

/** UI-27: persistent clinical safety notice ("Không phải dịch vụ cấp cứu – gọi 115" or hospital ward nurse prompt). NM-0193. */
type HcEmergencyBannerProps = {
  hospitalMode?: boolean;
  departmentName?: string;
};

export function HcEmergencyBanner({ hospitalMode = false, departmentName }: HcEmergencyBannerProps) {
  const { t } = useTranslation();

  return (
    <aside
      role="note"
      className="flex flex-wrap items-center justify-between gap-hc-sm rounded-hc-sm border border-hc-danger bg-hc-danger-subtle px-hc-md py-hc-ms"
    >
      <div className="flex min-w-0 flex-1 items-center gap-hc-sm text-hc-danger">
        <HcIcon name="emergency" dense />
        <span className="text-hc-body font-semibold">
          {hospitalMode
            ? departmentName
              ? `${t('ui.emergencyHospitalBanner')} (${departmentName})`
              : t('ui.emergencyHospitalBanner')
            : t('ui.emergencyBanner')}
        </span>
      </div>
      {!hospitalMode && (
        <a
          href="tel:115"
          className="hc-pressable inline-flex min-h-hc-touch items-center gap-hc-xs whitespace-nowrap rounded-hc-sm bg-hc-danger px-hc-md text-hc-body font-bold text-hc-on-primary shadow-hc-card hover:opacity-95"
        >
          <HcIcon name="call" dense />
          <span>{t('ui.call115')}</span>
        </a>
      )}
    </aside>
  );
}
