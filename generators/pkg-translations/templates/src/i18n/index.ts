import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import it from "./locales/it.json";
import en from "./locales/en.json";

export const defaultNS = "translation";
export const supportedLngs = ["it", "en"] as const;
export type SupportedLocale = (typeof supportedLngs)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      it: { [defaultNS]: it },
      en: { [defaultNS]: en },
    },
    defaultNS,
    fallbackLng: "it",
    supportedLngs: [...supportedLngs],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "app-locale",
    },
  });

export default i18n;
