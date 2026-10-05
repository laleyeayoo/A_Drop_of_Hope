// Lets TypeScript check translation keys: t('health.crisess') is a compile error.
import 'i18next';

import type en from './en';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
    returnObjects: true;
  }
}
