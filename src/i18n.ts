import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

export const supportedLanguages = ["en", "fr", "de", "it"] as const;

// Namespaces are just files under public/locales/{{lng}}/{{ns}}.json.
// "common" and "errors" mirror the old messages/strings.tsx and messages/errors.tsx.
// Add one namespace per page/feature as you migrate it (e.g. "login", "nav", "footer").
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

i18n
  .use(HttpBackend) // loads JSON files from /public/locales via HTTP, so nothing is bundled for languages a visitor never uses
  .use(LanguageDetector) // detects the language from localStorage, then navigator.language, then <html lang>
  .use(initReactI18next)
  .init({
    supportedLngs: supportedLanguages,
    fallbackLng: "en",
    ns: namespaces,
    defaultNS: "common",

    backend: {
      // Vite serves everything under /public at the site root
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
      useSuspense: true,
    },
  });

export default i18n;
