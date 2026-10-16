import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { localeCookie, resolveLocale } from "./core";

export const getLocale = cache(async () => {
  const store = await cookies();
  if (!getSupabaseConfig()) return resolveLocale(null, store.get(localeCookie)?.value);
  const supabase = await createClient();
  // getUser reads the current account from Auth, not potentially stale JWT metadata.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && store.getAll().some(({ name }) => name.startsWith("sb-"))) {
    // Never substitute a different person's anonymous preference during an Auth outage.
    return resolveLocale({ user_metadata: {} }, undefined);
  }
  return resolveLocale(user, store.get(localeCookie)?.value);
});
