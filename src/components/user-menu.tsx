"use client";

import { useTransition } from "react";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function UserMenu({ email }: { email: string | null }) {
  const [pending, startTransition] = useTransition();
  const initial = email?.[0]?.toUpperCase() || "R";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-auto gap-3 px-2 py-2" aria-label="Open profile menu" />}>
        <span className="grid size-9 place-items-center rounded-full bg-secondary font-medium text-primary">{initial}</span>
        <span className="hidden max-w-40 truncate text-sm md:block">{email || "Your account"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem disabled={pending} onClick={() => startTransition(async () => {
          try {
            const result = await signOut();
            if (!result.success) toast.error(result.message);
          } catch {
            // Successful sign-out redirects to the login page.
          }
        })}>{pending ? "Signing out…" : "Sign out"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
