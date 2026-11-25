import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from '@/i18n/vi.json';

/** UI-51: every visible string lives in src/i18n/vi.json. */
void i18n.use(initReactI18next).init({
  lng: 'vi',
  fallbackLng: 'vi',
  resources: { vi: { translation: vi } },
  interpolation: { escapeValue: false },
});

export default i18n;
