"use client";

import { useI18n } from "@/components/locale-provider";
import { BookCover } from "@/components/book-cover";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Book } from "@/lib/supabase/types";

// Lets long labels ("Marcar como terminado") wrap instead of overflowing on narrow phones.
const action = "h-auto min-h-9 whitespace-normal py-2 text-center pointer-coarse:h-auto pointer-coarse:min-h-11";

export function BookDetailDialog({ book, progress, open, onOpenChange, onEdit, onLocation, onStatus, onDelete }: {
  book: Book | null; progress: number; open: boolean; onOpenChange: (open: boolean) => void;
  onEdit: () => void; onLocation: () => void; onStatus: () => void; onDelete: () => void;
}) {
  const { t } = useI18n();
  return <Dialog open={open} onOpenChange={onOpenChange}>{book && open ? <DialogContent className="max-w-lg">
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
      <BookCover book={book}/>
      <div className="min-w-0"><DialogHeader><DialogTitle className="pr-5 text-xl">{book.title}</DialogTitle><DialogDescription>{book.author || t("Unknown author")}</DialogDescription></DialogHeader>
        <span className="mt-4 inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{book.status === "reading" ? t("Currently reading") : t("Finished")}</span>
        <p className="mt-4 text-sm text-muted-foreground">{book.current_page ? t(book.total_pages ? "Page {page} of {total}" : "Page {page}", { page: book.current_page, total: book.total_pages ?? 0 }) : t("No page saved yet")}{book.current_section ? ` · ${book.current_section}` : ""}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }}/></div><p className="mt-1 text-right text-xs text-muted-foreground">{progress}%</p>
      </div>
    </div>
    {book.note && <div className="rounded-lg bg-muted p-3"><p className="text-xs font-medium text-muted-foreground">{t("YOUR NOTE")}</p><p className="mt-1 whitespace-pre-wrap text-sm">{book.note}</p></div>}
    <div className="grid grid-cols-2 gap-2"><Button className={action} onClick={onLocation}>{t("Save my place")}</Button><Button variant="outline" className={action} onClick={onEdit}>{t("Edit details")}</Button><Button variant="secondary" className={action} onClick={onStatus}>{book.status === "reading" ? t("Mark as finished") : t("Continue reading")}</Button><Button variant="ghost" className={`${action} text-destructive hover:text-destructive`} onClick={onDelete}>{t("Remove book")}</Button></div>
  </DialogContent> : null}</Dialog>;
}
