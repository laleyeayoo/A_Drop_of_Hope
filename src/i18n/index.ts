/**
 * Translation setup. Import this file once (the root layout does) and then use
 * `const { t } = useTranslation();` in any screen: `t('health.crises')`.
 */
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en';

export const resources = {
  en: { translation: en },
} as const;

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage in resources ? deviceLanguage : 'en',
  fallbackLng: 'en',
  initAsync: false,
  returnObjects: true,
  interpolation: { escapeValue: false }, // React already escapes text
});

/** Locale for dates and numbers, e.g. "en-US". */
export const locale = getLocales()[0]?.languageTag ?? 'en-US';

export default i18n;
