"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { bookDetailsSchema, bookIdSchema, locationSchema, statusSchema, isPageWithinBook } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, user };
}

const expired: ActionState = { success: false, message: "Your session has expired. Sign in again to continue." };
const failed: ActionState = { success: false, message: "Your changes could not be saved. Please try again." };
const missing: ActionState = { success: false, message: "This book is no longer available. Refresh your library." };

export async function saveBook(id: string | null, _previous: ActionState, form: FormData): Promise<ActionState> {
  const parsed = bookDetailsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { success: false, message: "Check the highlighted fields.", fields: z.flattenError(parsed.error).fieldErrors };
  if (id !== null && !bookIdSchema.safeParse(id).success) return missing;
  try {
    const context = await authenticatedClient();
    if (!context) return expired;
    const { supabase, user } = context;
    if (id) {
      const { data: existing, error: readError } = await supabase.from("books").select("current_page").eq("id", id).eq("user_id", user.id).maybeSingle();
      if (readError) return failed;
      if (!existing) return missing;
      if (!isPageWithinBook(existing.current_page, parsed.data.total_pages)) {
        return { success: false, message: "The total cannot be less than your saved page.", fields: { total_pages: ["Update your bookmark before reducing the total."] } };
      }
    }
    const query = id
      ? supabase.from("books").update(parsed.data).eq("id", id).eq("user_id", user.id)
      : supabase.from("books").insert({ ...parsed.data, user_id: user.id });
    const { data, error } = await query.select("id").maybeSingle();
    if (error) return failed;
    if (!data) return missing;
    revalidatePath("/");
    return { success: true, message: id ? "Book details updated." : "A new chapter begins. Book added!" };
  } catch {
    return failed;
  }
}

export async function saveLocation(id: string, _previous: ActionState, form: FormData): Promise<ActionState> {
  const parsed = locationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { success: false, message: "Check the highlighted fields.", fields: z.flattenError(parsed.error).fieldErrors };
  if (!bookIdSchema.safeParse(id).success) return missing;
  try {
    const context = await authenticatedClient();
    if (!context) return expired;
    const { supabase, user } = context;
    const { data: book, error: readError } = await supabase.from("books").select("total_pages").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (readError) return failed;
    if (!book) return missing;
    if (!isPageWithinBook(parsed.data.current_page, book.total_pages)) {
      return { success: false, message: "Enter a page between 1 and {total}.", params: { total: book.total_pages! }, fields: { current_page: ["Your page is beyond the end of this book."] } };
    }
    const { data, error } = await supabase.from("books").update(parsed.data).eq("id", id).eq("user_id", user.id).select("id").maybeSingle();
    if (error) return failed;
    if (!data) return missing;
    revalidatePath("/");
    return { success: true, message: "Your place is saved. See you next chapter." };
  } catch {
    return failed;
  }
}

export async function changeBookStatus(id: string, status: string): Promise<ActionState> {
  if (!bookIdSchema.safeParse(id).success || !statusSchema.safeParse(status).success) return missing;
  try {
    const context = await authenticatedClient();
    if (!context) return expired;
    const { data, error } = await context.supabase.from("books").update({ status: status as "reading" | "finished" }).eq("id", id).eq("user_id", context.user.id).select("id").maybeSingle();
    if (error) return failed;
    if (!data) return missing;
    revalidatePath("/");
    return { success: true, message: status === "finished" ? "Another story, well read. Book finished!" : "Book moved back to currently reading." };
  } catch {
    return failed;
  }
}

export async function deleteBook(id: string): Promise<ActionState> {
  if (!bookIdSchema.safeParse(id).success) return missing;
  try {
    const context = await authenticatedClient();
    if (!context) return expired;
    const { data, error } = await context.supabase.from("books").delete().eq("id", id).eq("user_id", context.user.id).select("id").maybeSingle();
    if (error) return failed;
    if (!data) return missing;
    revalidatePath("/");
    return { success: true, message: "Book removed from your library." };
  } catch {
    return failed;
  }
}
