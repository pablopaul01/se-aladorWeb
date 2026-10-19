"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { bookIdSchema, noteSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

const failed: ActionState = { success: false, message: "Your changes could not be saved. Please try again." };
const missing: ActionState = { success: false, message: "This note or book is no longer available. Refresh your library." };
const expired: ActionState = { success: false, message: "Your session has expired. Sign in again to continue." };

export async function saveNote(bookId: string, noteId: string | null, _previous: ActionState, form: FormData): Promise<ActionState> {
  if (!bookIdSchema.safeParse(bookId).success || (noteId !== null && !bookIdSchema.safeParse(noteId).success)) return missing;
  const parsed = noteSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { success: false, message: "Check the highlighted fields.", fields: z.flattenError(parsed.error).fieldErrors };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return expired;
    const { data: book, error: bookError } = await supabase.from("books").select("id").eq("id", bookId).eq("user_id", user.id).maybeSingle();
    if (bookError) return failed;
    if (!book) return missing;
    const query = noteId
      ? supabase.from("book_notes").update(parsed.data).eq("id", noteId).eq("book_id", bookId).eq("user_id", user.id)
      : supabase.from("book_notes").insert({ ...parsed.data, book_id: bookId, user_id: user.id });
    const { data, error } = await query.select("id").maybeSingle();
    if (error) return failed;
    if (!data) return missing;
    revalidatePath("/");
    return { success: true, message: "Note saved." };
  } catch {
    return failed;
  }
}

export async function deleteNote(bookId: string, noteId: string): Promise<ActionState> {
  if (!bookIdSchema.safeParse(bookId).success || !bookIdSchema.safeParse(noteId).success) return missing;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return expired;
    const { data, error } = await supabase.from("book_notes").delete().eq("id", noteId).eq("book_id", bookId).eq("user_id", user.id).select("id").maybeSingle();
    if (error) return failed;
    if (!data) return missing;
    revalidatePath("/");
    return { success: true, message: "Note deleted." };
  } catch {
    return failed;
  }
}
