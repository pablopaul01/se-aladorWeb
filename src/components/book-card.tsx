"use client";

import type { Book } from "@/lib/supabase/types";
import { BookCover } from "@/components/book-cover";

export function BookCard({ book, progress, onOpen }: { book: Book; progress: number; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" aria-label={`Open ${book.title}`}>
      <BookCover book={book} className="transition-transform duration-200 group-hover:-translate-y-1" />
      <span className="mt-3 block truncate font-heading text-base font-semibold">{book.title}</span>
      <span className="mt-0.5 block truncate text-sm text-muted-foreground">{book.author || "Unknown author"}</span>
      <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></span>
      <span className="mt-1.5 flex justify-between text-xs text-muted-foreground"><span>{book.status === "finished" ? "Finished" : book.current_page ? `Page ${book.current_page}${book.total_pages ? ` of ${book.total_pages}` : ""}` : "Not started"}</span><span>{progress}%</span></span>
    </button>
  );
}
