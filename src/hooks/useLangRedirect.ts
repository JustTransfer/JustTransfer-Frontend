import { supportedLanguages } from "../i18n";

type SupportedLang = (typeof supportedLanguages)[number];

// Returns true if the given value is a supported language code.
export function isSupportedLang(
  value: string | undefined,
): value is SupportedLang {
  return !!value && supportedLanguages.includes(value as SupportedLang);
}

// Current i18n language if supported, else its base ("en-US" -> "en"), else "en".
export function resolvePreferredLang(i18nLanguage: string): SupportedLang {
  if (isSupportedLang(i18nLanguage)) return i18nLanguage;
  const base = i18nLanguage?.split("-")[0];
  return isSupportedLang(base) ? base : "en";
}

// Returns the current language from the URL path, or "en" if not present or unsupported.
export function withLangPrefix(
  lang: SupportedLang,
  location: { pathname: string; search: string; hash: string },
): string {
  const path = location.pathname === "/" ? "" : location.pathname;
  return `/${lang}${path}${location.search}${location.hash}`;
}
