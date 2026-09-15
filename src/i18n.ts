import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

export const supportedLanguages = ["en", "fr", "de", "it"] as const;

export const namespaces = [
  "common",
  "errors",
  "nav",
  "footer",
  "login",
  "auth",
  "pricing",
  "home",
  "faq",
  "comparison",
  "account",
] as const;

export const i18nInitPromise = i18n
  .use(HttpBackend) // loads JSON files from /public/locales via HTTP, so nothing is bundled for languages a visitor never uses
  .use(LanguageDetector) // detects the language from localStorage, then navigator.language, then <html lang>
  .use(initReactI18next)
  .init({
    supportedLngs: supportedLanguages,
    fallbackLng: "en",
    ns: namespaces,
    defaultNS: "common",

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "jt_language",
    },

    interpolation: {
      escapeValue: false, // React already escapes output
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
