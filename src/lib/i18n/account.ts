import type { User, UserResponse, UserAttributes } from "@supabase/supabase-js";
import type { Locale } from "./core";

type AccountAuth = {
  getUser: () => Promise<UserResponse>;
  updateUser: (attributes: UserAttributes) => Promise<{ data: { user: User | null }; error: unknown }>;
};

// Only a verified current account may be updated; anonymous sessions only use a cookie.
export async function persistAccountLocale(auth: AccountAuth, locale: Locale, hasSessionCookie: boolean): Promise<boolean> {
  const { data: { user }, error } = await auth.getUser();
  if (error && hasSessionCookie) return false;
  if (!user) return !hasSessionCookie;
  const result = await auth.updateUser({ data: { locale } });
  return !result.error && result.data.user !== null;
}
