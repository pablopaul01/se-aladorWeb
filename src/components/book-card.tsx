"use client";

import { useI18n } from "@/components/locale-provider";
import type { Book } from "@/lib/supabase/types";
import { BookCover } from "@/components/book-cover";

export function BookCard({ book, progress, onOpen }: { book: Book; progress: number; onOpen: () => void }) {
  const { t } = useI18n();
  return (
    <button type="button" onClick={onOpen} className="group w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" aria-label={t("Open {title}", { title: book.title })}>
      <BookCover book={book} className="transition-transform duration-200 group-hover:-translate-y-1" />
      <span className="mt-3 block truncate font-heading text-base font-semibold">{book.title}</span>
      <span className="mt-0.5 block truncate text-sm text-muted-foreground">{book.author || t("Unknown author")}</span>
      <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></span>
      <span className="mt-1.5 flex justify-between text-xs text-muted-foreground"><span>{book.status === "finished" ? t("Finished") : book.current_page ? t(book.total_pages ? "Page {page} of {total}" : "Page {page}", { page: book.current_page, total: book.total_pages ?? 0 }) : t("Not started")}</span><span>{progress}%</span></span>
    </button>
  );
}
