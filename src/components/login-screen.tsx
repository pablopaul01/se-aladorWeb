"use client";

import { useI18n } from "@/components/locale-provider";
import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";
import { LanguageSelector } from "@/components/locale-provider";
import { BookOpen, Bookmark, Leaf, ArrowUpRight } from "lucide-react";
export function LoginScreen({ configured }: { configured: boolean }) {
  const { t } = useI18n();
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-2">
      <section className="paper-grid relative hidden flex-col justify-between overflow-hidden border-r bg-[#efede4] p-12 lg:flex xl:p-16">
        <Brand />
        <div className="mx-auto my-12 w-full max-w-lg">
          <span className="mb-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Leaf className="size-4" /> {t("A little space for reading")}</span>
          <h1 className="editorial text-6xl leading-[1.1] xl:text-7xl">{t("Every story deserves")}<br /><em className="text-primary">{t("a place to pause.")}</em></h1>
          <p className="mt-7 max-w-sm text-base leading-7 text-muted-foreground">{t("Keep your books close, save your place, and come back to a good story. At your own pace.")}</p>
          <div className="relative mx-auto mt-16 h-48 w-64" aria-hidden="true">
            <div className="book-spine absolute bottom-0 left-4 h-40 w-28 -rotate-12 rounded-r-md bg-[#77856f] p-5 text-[#f6f1df]"><span className="editorial text-xl">{t("One more")}<br />{t("chapter.")}</span><div className="mt-8 border-t border-white/30 pt-2 text-[9px] uppercase tracking-widest">{t("A reader's life")}</div></div>
            <div className="book-spine absolute right-4 bottom-0 h-48 w-32 rotate-12 rounded-r-md bg-[#a54e38] p-5 text-[#fff3d9]"><Bookmark className="absolute -top-1 right-5 size-9 fill-[#e5bc7b] text-[#e5bc7b]" /><BookOpen className="mt-6 size-6" strokeWidth={1} /><span className="editorial mt-3 block text-2xl">{t("A place")}<br />{t("to return.")}</span></div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{t("Less scrolling. More stories.")} <ArrowUpRight className="ml-1 inline size-3" /></p>
      </section>
      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-12">
        <div className="mb-12 flex items-center justify-between gap-3"><Brand className="lg:hidden" /><LanguageSelector /></div>
        <div className="m-auto w-full max-w-sm py-8"><AuthForm configured={configured} /></div>
        <p className="mt-8 text-center text-xs text-muted-foreground">{t("Your books. Your pace. Your little reading corner.")}</p>
      </section>
    </main>
  );
}
