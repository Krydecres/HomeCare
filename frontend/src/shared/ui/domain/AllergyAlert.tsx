import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';

/** UI-27 / UI-23b: high-visibility red medical allergy & PPE alert card (US-02-002). NM-0193. */
type AllergyAlertProps = {
  allergies: string[];
  title?: string;
  ppeWarning?: string;
};

export function AllergyAlert({ allergies, title, ppeWarning }: AllergyAlertProps) {
  const { t } = useTranslation();
  if (allergies.length === 0 && !ppeWarning) return null;

  return (
    <section
      role="alert"
      className="flex flex-col gap-hc-xs rounded-hc-sm border border-hc-danger bg-hc-danger-subtle p-hc-md text-hc-danger"
    >
      <div className="flex items-center gap-hc-sm">
        <HcIcon name="medical_information" dense />
        <h3 className="m-0 text-hc-subtitle font-bold">{title ?? t('ui.allergyTitle')}</h3>
      </div>
      {allergies.length > 0 && (
        <ul className="m-0 list-disc pl-hc-lg text-hc-body font-semibold text-hc-text-primary">
          {allergies.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {ppeWarning && <p className="m-0 text-hc-body font-semibold text-hc-danger">{ppeWarning}</p>}
    </section>
  );
}
