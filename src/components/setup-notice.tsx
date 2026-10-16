"use client";

import { useI18n } from "@/components/locale-provider";
import { Settings2 } from "lucide-react";

export function SetupNotice() {
  const { t } = useI18n();
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-[#e1d3bd] bg-[#f5eedf] p-4 text-sm text-[#6f5531]">
      <Settings2 className="mt-0.5 size-4 shrink-0" />
      <div><p className="font-semibold">{t("Your reading corner is almost ready.")}</p>
        <p className="mt-1 leading-relaxed">{t("Connect Supabase in .env.local, run the books migration, and disable email confirmation. Follow README.md to enable accounts and saving.")}</p>
      </div>
    </div>
  );
}
