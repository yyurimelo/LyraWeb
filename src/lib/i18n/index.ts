import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files

import enTranslations from "@/languages/en.json"
import ptBRTranslations from "@/languages/pt-BR.json"

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('lyra-language') || 'en';

const resources = {
  en: {
    translation: enTranslations
  },
  'pt-BR': {
    translation: ptBRTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false
    },

    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lyra-language'
    }
  });

export default i18n;