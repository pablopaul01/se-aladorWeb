"use client";

import { LanguageSelector, useI18n } from "@/components/locale-provider";
import { useTransition } from "react";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function UserMenu({ email }: { email: string | null }) {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const initial = email?.[0]?.toUpperCase() || "R";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-auto gap-3 rounded-full px-1 py-1 pointer-coarse:h-auto pointer-coarse:px-1 md:rounded-lg md:px-2 md:py-2 md:pointer-coarse:px-2" aria-label={t("Open profile menu")} />}>
        <span className="grid size-9 place-items-center rounded-full bg-secondary font-medium text-primary">{initial}</span>
        <span className="hidden max-w-40 truncate text-sm md:block">{email || t("Your account")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="md:hidden"><LanguageSelector/></div>
        <DropdownMenuItem disabled={pending} onClick={() => startTransition(async () => {
          try {
            const result = await signOut();
            if (!result.success) toast.error(t(result.message));
          } catch {
            // Successful sign-out redirects to the login page.
          }
        })}>{pending ? t("Signing out…") : t("Sign out")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
