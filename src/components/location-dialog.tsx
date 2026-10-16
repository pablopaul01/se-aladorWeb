"use client";

import { useI18n } from "@/components/locale-provider";
import { useActionState, useEffect } from "react";
import { saveLocation } from "@/app/actions";
import { FieldError, FormFeedback } from "@/components/form-feedback";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/action-state";
import type { Book } from "@/lib/supabase/types";
import { toast } from "sonner";

export function LocationDialog({ book, open, onOpenChange }: { book: Book | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>{book && open ? <LocationForm key={book.id} book={book} onOpenChange={onOpenChange}/> : null}</Dialog>;
}

function LocationForm({ book, onOpenChange }: { book: Book; onOpenChange: (open: boolean) => void }) {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(saveLocation.bind(null, book.id), initialActionState);
  useEffect(() => {
    if (state.success) { toast.success(t(state.message)); onOpenChange(false); }
  }, [state, onOpenChange, t]);
  return (
    <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{t("Save your place")}</DialogTitle><DialogDescription>{t("Pick up where you left off in {title}.", { title: book.title })}</DialogDescription></DialogHeader>
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="current-page">{t("Page")} <span className="text-muted-foreground">{t("(optional)")}</span></Label><Input id="current-page" name="current_page" type="number" min={1} max={book.total_pages ?? 1000000} defaultValue={book.current_page ?? ""} aria-invalid={Boolean(state.fields?.current_page?.length)} aria-describedby="current-page-error"/><FieldError id="current-page-error" errors={state.fields?.current_page}/></div>
        <div className="grid gap-2"><Label htmlFor="current-section">{t("Chapter or section")}</Label><Input id="current-section" name="current_section" maxLength={200} defaultValue={book.current_section ?? ""} aria-invalid={Boolean(state.fields?.current_section?.length)} aria-describedby="current-section-error"/><FieldError id="current-section-error" errors={state.fields?.current_section}/></div>
        <div className="grid gap-2"><Label htmlFor="reading-note">{t("Note")}</Label><Textarea id="reading-note" name="note" maxLength={2000} defaultValue={book.note ?? ""} placeholder={t("A thought to remember…")} aria-invalid={Boolean(state.fields?.note?.length)} aria-describedby="reading-note-error"/><FieldError id="reading-note-error" errors={state.fields?.note}/></div>
        <FormFeedback state={state}/><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Cancel")}</Button><Button type="submit" disabled={pending}>{pending ? t("Saving…") : t("Save my place")}</Button></div>
      </form>
    </DialogContent>
  );
}
