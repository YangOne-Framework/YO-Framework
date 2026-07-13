import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { BaseEndpoints } from './config/BaseEndpoints';
import en from './locale/en';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lowerCaseLng: true,
    debug: true,
    saveMissing: true,
    load: 'currentOnly',
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
    backend: {
      loadPath: `${BaseEndpoints.base}/locale/locale_resources-{{lng}}.json`,
      addPath: `${BaseEndpoints.base}/api/v1/localization/resource/missing`,
      parse: (data: string) => {
        try {
          const groups = JSON.parse(data);
          const flat: Record<string, string> = {};
          groups.forEach((g: any) => {
            g.Locales?.forEach((l: any) => {
              flat[l.Name] = l.Value ? String(l.Value) : "";
            });
          });
          return flat;
        } catch {
          return {};
        }
      },
      request: (options: any, url: string, payload: any, callback: any) => {
        if (payload) {
          
          const raw = i18n.language?.toLowerCase() || 'en-us';
          console.log(`Reporting missing translation for key "${payload.key}" in culture "${raw}"`);
          const culture =  raw;
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Culture': culture },
            body: JSON.stringify(payload),
          })
            .then((res) => {
              if (!res.ok) return res.text().then((t) => callback(new Error(t), null));
              callback(null, { status: res.status, data: '' });
            })
            .catch((err) => callback(err, null));
        } else {
          fetch(url)
            .then((res) => res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`)))
            .then((text) => callback(null, { status: 200, data: text }))
            .catch((err) => callback(err, null));
        }
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

i18n.addResourceBundle('en', 'translation', en, true, true);

export default i18n;
