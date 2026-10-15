"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { credentialsSchema, registrationSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

export async function authenticate(mode: "login" | "signup", _previous: ActionState, form: FormData): Promise<ActionState> {
  if (mode !== "login" && mode !== "signup") return { success: false, message: "Invalid request." };
  const input = Object.fromEntries(form);
  if (typeof input.email === "string") input.email = input.email.trim();
  const parsed = (mode === "signup" ? registrationSchema : credentialsSchema).safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fields: z.flattenError(parsed.error).fieldErrors };
  }
  if (!getSupabaseConfig()) return { success: false, message: "Connect Supabase before signing in. See the setup instructions in README.md." };

  try {
    const supabase = await createClient();
    const credentials = { email: parsed.data.email, password: parsed.data.password };
    const { data, error } = mode === "signup"
      ? await supabase.auth.signUp(credentials)
      : await supabase.auth.signInWithPassword(credentials);

    if (error) {
      const message = error.code === "user_already_exists" ? "This email is already registered. Try signing in."
        : error.code === "weak_password" ? "Choose a stronger password with at least 8 characters."
        : error.status === 429 ? "Too many attempts. Please wait a moment and try again."
        : mode === "login" ? "Could not sign in. Check your email and password."
        : "Could not create your account. Try another email or try again shortly.";
      return { success: false, message };
    }
    if (!data.session) {
      return { success: false, message: "Email confirmation is enabled in Supabase. Disable Confirm email in Authentication → Sign In / Providers → Email to allow immediate access." };
    }
  } catch {
    return { success: false, message: "We could not reach the sign-in service. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut(): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, message: "Could not sign out. Please try again." };
  } catch {
    return { success: false, message: "Could not sign out. Check your connection and try again." };
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
