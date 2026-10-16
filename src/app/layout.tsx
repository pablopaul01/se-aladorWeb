import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/components/locale-provider";
import { getLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/core";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f2e8",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: translate(locale, "Señalador — A place for your next chapter"),
    description: translate(locale, "Your quiet little reading corner. Keep your books together and pick up exactly where you left off."),
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <Suspense fallback={<html lang="es"><body /></html>}><LocalizedDocument>{children}</LocalizedDocument></Suspense>;
}

async function LocalizedDocument({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return <html lang={locale} className="h-full antialiased"><body className="min-h-full">
    <LocaleProvider initialLocale={locale}>{children}<Toaster theme="light" position="bottom-right" mobileOffset={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }} richColors /></LocaleProvider>
  </body></html>;
}
