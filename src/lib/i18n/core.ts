import { es } from "./messages";

export type Locale = "es" | "en";
export const localeCookie = "senalador-locale";
export const defaultLocale: Locale = "es";
export const isLocale = (value: unknown): value is Locale => value === "es" || value === "en";
export const normalizeLocale = (value: unknown): Locale => isLocale(value) ? value : defaultLocale;

// An authenticated account always wins, including accounts without a saved preference.
export function resolveLocale(user: { user_metadata?: Record<string, unknown> } | null, anonymous: unknown): Locale {
  return normalizeLocale(user ? user.user_metadata?.locale : anonymous);
}

export function translate(locale: Locale, key: string, params: Record<string, string | number> = {}): string {
  const template = locale === "es" ? es[key as keyof typeof es] ?? es["Invalid value."] : key;
  return template.replace(/\{(\w+)\}/g, (token, name: string) => {
    const value = params[name];
    return value === undefined ? token : typeof value === "number" ? new Intl.NumberFormat(locale).format(value) : value;
  });
}

export function bookCount(locale: Locale, count: number): string {
  return translate(locale, new Intl.PluralRules(locale).select(count) === "one" ? "{count} book" : "{count} books", { count });
}
