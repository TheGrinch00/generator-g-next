import { cookies } from "next/headers";
import it from "@/i18n/locales/it.json";
import en from "@/i18n/locales/en.json";

export type SupportedLocale = "it" | "en";
export type Translations = typeof it;

const translations = {
  it,
  en,
} as const;

export function getTranslations(locale: SupportedLocale): Translations {
  return translations[locale] || translations.it;
}

export function getLocaleFromCookie(
  cookieValue: string | undefined,
): SupportedLocale {
  if (cookieValue === "en") return "en";
  return "it";
}

export async function getSSRTranslations(): Promise<{
  translations: Translations;
  locale: SupportedLocale;
}> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("app-locale")?.value;
  const locale = getLocaleFromCookie(localeCookie);
  const t = getTranslations(locale);

  return { translations: t, locale };
}
