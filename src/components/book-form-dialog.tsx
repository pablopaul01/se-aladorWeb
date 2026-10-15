"use client";

import { useActionState, useEffect } from "react";
import { saveBook } from "@/app/actions";
import { FieldError, FormFeedback } from "@/components/form-feedback";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";
import type { Book } from "@/lib/supabase/types";
import { toast } from "sonner";

export function BookFormDialog({ book, open, onOpenChange }: { book: Book | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>{open ? <BookForm key={book?.id || "new"} book={book} onOpenChange={onOpenChange} /> : null}</Dialog>;
}

function BookForm({ book, onOpenChange }: { book: Book | null; onOpenChange: (open: boolean) => void }) {
  const action = saveBook.bind(null, book?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialActionState);
  useEffect(() => {
    if (state.success) { toast.success(state.message); onOpenChange(false); }
  }, [state, onOpenChange]);
  return (
    <DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>{book ? "Edit book details" : "Add a book"}</DialogTitle><DialogDescription>Keep the details you need to find your place again.</DialogDescription></DialogHeader>
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="book-title">Title</Label><Input id="book-title" name="title" required maxLength={200} defaultValue={book?.title ?? ""} aria-invalid={Boolean(state.fields?.title?.length)} aria-describedby="book-title-error"/><FieldError id="book-title-error" errors={state.fields?.title}/></div>
        <div className="grid gap-2"><Label htmlFor="book-author">Author</Label><Input id="book-author" name="author" maxLength={200} defaultValue={book?.author ?? ""} aria-invalid={Boolean(state.fields?.author?.length)} aria-describedby="book-author-error"/><FieldError id="book-author-error" errors={state.fields?.author}/></div>
        <div className="grid gap-2"><Label htmlFor="book-pages">Total pages <span className="text-muted-foreground">(optional)</span></Label><Input id="book-pages" name="total_pages" type="number" min={1} max={1000000} defaultValue={book?.total_pages ?? ""} aria-invalid={Boolean(state.fields?.total_pages?.length)} aria-describedby="book-pages-error"/><FieldError id="book-pages-error" errors={state.fields?.total_pages}/></div>
        {book && <><input type="hidden" name="current_page" value={book.current_page ?? ""}/><input type="hidden" name="current_section" value={book.current_section ?? ""}/><input type="hidden" name="note" value={book.note ?? ""}/></>}
        <FormFeedback state={state}/>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? "Saving…" : book ? "Save changes" : "Add to library"}</Button></div>
      </form>
    </DialogContent>
  );
}
