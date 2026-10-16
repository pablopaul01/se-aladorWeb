"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { persistAccountLocale } from "@/lib/i18n/account";
import { isLocale, localeCookie } from "@/lib/i18n/core";

export async function saveLocale(value: unknown): Promise<boolean> {
  if (!isLocale(value)) return false;
  try {
    if (getSupabaseConfig()) {
      const supabase = await createClient();
      const store = await cookies();
      const hasSessionCookie = store.getAll().some(({ name }) => name.startsWith("sb-"));
      if (!await persistAccountLocale(supabase.auth, value, hasSessionCookie)) return false;
    }
    (await cookies()).set(localeCookie, value, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365,
    });
    return true;
  } catch {
    return false;
  }
}
