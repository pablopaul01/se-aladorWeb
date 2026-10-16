"use client";

import { createContext, useContext, useState, useRef, useCallback, useLayoutEffect } from "react";
import { saveLocale } from "@/app/locale-actions";
import { translate, type Locale } from "@/lib/i18n/core";
import { toast } from "sonner";

type I18n = {
  locale: Locale;
  pending: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  changeLocale: (locale: Locale) => Promise<void>;
};
const Context = createContext<I18n | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocale] = useState(initialLocale);
  const [sourceLocale, setSourceLocale] = useState(initialLocale);
  if (sourceLocale !== initialLocale) {
    setSourceLocale(initialLocale);
    setLocale(initialLocale);
  }
  const [pending, setPending] = useState(false);
  const locked = useRef(false);
  const t = useCallback((key: string, params?: Record<string, string | number>) => translate(locale, key, params), [locale]);
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.title = t("Señalador — A place for your next chapter");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("Your quiet little reading corner. Keep your books together and pick up exactly where you left off."));
  }, [locale, t]);

  async function changeLocale(next: Locale) {
    if (locked.current || next === locale) return;
    locked.current = true;
    setPending(true);
    try {
      if (await saveLocale(next)) setLocale(next);
      else toast.error(t("Could not save your language. Please try again."));
    } catch {
      toast.error(t("Could not save your language. Please try again."));
    } finally {
      locked.current = false;
      setPending(false);
    }
  }
  return <Context.Provider value={{ locale, pending, t, changeLocale }}>{children}</Context.Provider>;
}

export function useI18n() {
  const context = useContext(Context);
  if (!context) throw new Error("useI18n requires LocaleProvider");
  return context;
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, pending, t, changeLocale } = useI18n();
  return <label className="flex items-center gap-2 px-2 py-2 text-sm">
    <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{t("Language")}</span>
    <select aria-label={t("Language")} value={locale} disabled={pending} onChange={(event) => void changeLocale(event.target.value as Locale)} className="min-w-0 rounded-md border bg-background px-2 py-1 text-base text-foreground pointer-coarse:min-h-10 md:text-sm">
      <option value="es" lang="es">Español</option><option value="en" lang="en">English</option>
    </select>
    {pending && <span role="status" className="sr-only">{t("Saving language…")}</span>}
  </label>;
}
