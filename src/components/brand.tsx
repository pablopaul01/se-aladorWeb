"use client";

import { useI18n } from "@/components/locale-provider";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { cn } from "cn";

export function Brand({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label={t("Señalador home")}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white"><Bookmark className="size-5" strokeWidth={1.6} /></span>
      <span className="editorial text-[27px] font-semibold">señalador<span className="text-primary">.</span></span>
    </Link>
  );
}
