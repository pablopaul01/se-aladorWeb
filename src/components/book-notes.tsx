"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { saveNote, deleteNote } from "@/app/note-actions";
import { useI18n } from "@/components/locale-provider";
import { FieldError, FormFeedback } from "@/components/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/action-state";
import { submitWithoutReset } from "@/lib/form";
import type { BookNote } from "@/lib/supabase/types";
import { toast } from "sonner";

export function BookNotes({ bookId, notes, loadError }: { bookId: string; notes: BookNote[]; loadError: boolean }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<BookNote | "new" | null>(null);
  const [pending, startTransition] = useTransition();

  function remove(note: BookNote) {
    if (!window.confirm(t("Delete this note?"))) return;
    startTransition(async () => {
      const result = await deleteNote(bookId, note.id);
      if (result.success) toast.success(t(result.message));
      else toast.error(t(result.message));
    });
  }

  return <section aria-label={t("Notes")} className="min-w-0 border-t pt-4">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="font-medium">{t("Notes")} · {notes.length}</h2>
      <Button type="button" variant="outline" size="sm" disabled={editing !== null || pending || loadError} onClick={() => setEditing("new")}>{t("Add note")}</Button>
    </div>
    {loadError ? <p role="alert" className="text-sm text-destructive">{t("Your notes could not be loaded. Refresh the page to try again.")}</p> : null}
    {editing !== null ? <NoteForm key={editing === "new" ? "new" : editing.id} bookId={bookId} note={editing === "new" ? null : editing} onClose={() => setEditing(null)}/> : null}
    {!loadError && !notes.length && editing === null ? <p className="text-sm text-muted-foreground">{t("No notes yet. Save a thought without changing your progress.")}</p> : null}
    <ul className="grid gap-3">
      {notes.map((note) => <li key={note.id} className="min-w-0 rounded-lg bg-muted p-3">
        <p className="break-words text-xs font-medium text-muted-foreground">{note.reference_type === "pending" ? t("Location pending") : [note.reference_type === "range" ? t("Pages {start}–{end}", { start: note.page_start!, end: note.page_end! }) : note.reference_type === "page" ? t("Page {page}", { page: note.page_start! }) : null, note.reference].filter(Boolean).join(" · ")}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm">{note.content}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="ghost" disabled={editing !== null || pending} onClick={() => setEditing(note)}>{t("Edit note")}</Button>
          <Button type="button" size="sm" variant="ghost" disabled={editing !== null || pending} onClick={() => remove(note)}>{t("Delete note")}</Button>
        </div>
      </li>)}
    </ul>
  </section>;
}

function NoteForm({ bookId, note, onClose }: { bookId: string; note: BookNote | null; onClose: () => void }) {
  const { t } = useI18n();
  const [type, setType] = useState<"page" | "range" | "reference">(note?.reference_type === "pending" ? "reference" : note?.reference_type ?? "reference");
  const [state, formAction, pending] = useActionState(saveNote.bind(null, bookId, note?.id ?? null), initialActionState);
  useEffect(() => {
    if (state.success) { toast.success(t(state.message)); onClose(); }
  }, [state, onClose, t]);

  return <form onSubmit={submitWithoutReset(formAction)} className="mb-4 grid gap-3 rounded-lg border p-3" aria-label={note ? t("Edit note") : t("Add note")}>
    {note?.reference_type === "pending" ? <p className="text-sm text-muted-foreground">{t("Choose a location to save this existing note.")}</p> : null}
    <div className="grid gap-2">
      <Label htmlFor="note-content">{t("Note")}</Label>
      <Textarea id="note-content" name="content" required maxLength={2000} defaultValue={note?.content ?? ""} placeholder={t("A thought to remember…")} aria-invalid={Boolean(state.fields?.content?.length)} aria-describedby="note-content-error"/>
      <FieldError id="note-content-error" errors={state.fields?.content}/>
    </div>
    <div className="grid gap-2">
      <Label htmlFor="note-location-type">{t("Page location")}</Label>
      <select id="note-location-type" name="reference_type" value={type} onChange={(event) => setType(event.target.value as typeof type)} disabled={pending} className="h-9 w-full min-w-0 rounded-md border bg-background px-3 text-sm" aria-invalid={Boolean(state.fields?.reference_type?.length)} aria-describedby="note-location-type-error note-location-help">
        <option value="reference">{t("No page or range")}</option>
        <option value="page">{t("Page")}</option>
        <option value="range">{t("Page range")}</option>
      </select>
      <FieldError id="note-location-type-error" errors={state.fields?.reference_type}/>
    </div>
    {type === "page" || type === "range" ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="note-page-start">{type === "range" ? t("Start page") : t("Page")}</Label>
        <Input id="note-page-start" name="page_start" type="number" required min={1} max={1000000} defaultValue={note?.page_start ?? ""} aria-invalid={Boolean(state.fields?.page_start?.length)} aria-describedby="note-page-start-error"/>
        <FieldError id="note-page-start-error" errors={state.fields?.page_start}/>
      </div>
      {type === "range" ? <div className="grid gap-2">
        <Label htmlFor="note-page-end">{t("End page")}</Label>
        <Input id="note-page-end" name="page_end" type="number" required min={1} max={1000000} defaultValue={note?.page_end ?? ""} aria-invalid={Boolean(state.fields?.page_end?.length)} aria-describedby="note-page-end-error"/>
        <FieldError id="note-page-end-error" errors={state.fields?.page_end}/>
      </div> : null}
    </div> : null}
    <div className="grid gap-2">
      <Label htmlFor="note-reference">{t("Section or reference")}</Label>
      <Input id="note-reference" name="reference" required={type === "reference"} maxLength={200} defaultValue={note?.reference ?? ""} placeholder={t("Chapter 4 or John 1, 4-5")} aria-invalid={Boolean(state.fields?.reference?.length)} aria-describedby="note-reference-error note-location-help"/>
      <FieldError id="note-reference-error" errors={state.fields?.reference}/>
    </div>
    <p id="note-location-help" className="text-xs text-muted-foreground">{t("Add a page, a page range, or a section/reference. You can combine pages with a section/reference.")}</p>
    <FormFeedback state={state}/>
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" disabled={pending} onClick={onClose}>{t("Cancel")}</Button>
      <Button type="submit" disabled={pending}>{pending ? t("Saving…") : t("Save note")}</Button>
    </div>
  </form>;
}
