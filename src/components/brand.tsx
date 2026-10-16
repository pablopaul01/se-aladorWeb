"use client";

import { useI18n } from "@/components/locale-provider";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { cn } from "cn";

export function Brand({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={t("Señalador home")}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white sm:size-9"><Bookmark className="size-[18px] sm:size-5" strokeWidth={1.6} /></span>
      <span className="editorial text-[22px] font-semibold sm:text-[27px]">señalador<span className="text-primary">.</span></span>
    </Link>
  );
}
