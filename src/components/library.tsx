"use client";

import { bookCount } from "@/lib/i18n/core";
import { LanguageSelector, useI18n } from "@/components/locale-provider";
import { useMemo, useState, useTransition } from "react";
import { BookOpen, ChartNoAxesColumnIncreasing, Plus, Search, UserRound } from "lucide-react";
import { changeBookStatus, deleteBook } from "@/app/actions";
import { BookCard } from "@/components/book-card";
import { BookDetailDialog } from "@/components/book-detail-dialog";
import { BookFormDialog } from "@/components/book-form-dialog";
import { Brand } from "@/components/brand";
import { LocationDialog } from "@/components/location-dialog";
import { SetupNotice } from "@/components/setup-notice";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Book } from "@/lib/supabase/types";
import { toast } from "sonner";
import { cn } from "cn";

type View = "Library" | "Search" | "Stats" | "Profile";
type Filter = "All books" | "Reading" | "Finished";
const navigation: { name: View; icon: typeof BookOpen }[] = [
  { name: "Library", icon: BookOpen }, { name: "Search", icon: Search },
  { name: "Stats", icon: ChartNoAxesColumnIncreasing }, { name: "Profile", icon: UserRound },
];

function progressFor(book: Book) {
  if (book.status === "finished") return 100;
  if (!book.total_pages || !book.current_page) return 0;
  return Math.min(100, Math.round((book.current_page / book.total_pages) * 100));
}

export function Library({ books, email, configured, loadError = false }: { books: Book[]; email: string | null; configured: boolean; loadError?: boolean }) {
  const { t, locale } = useI18n();
  const [view, setView] = useState<View>("Library");
  const [filter, setFilter] = useState<Filter>("All books");
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const selected = useMemo(() => books.find((book) => book.id === detailId) ?? null, [books, detailId]);
  const locationBook = useMemo(() => books.find((book) => book.id === locationId) ?? null, [books, locationId]);
  const editingBook = useMemo(() => books.find((book) => book.id === formId) ?? null, [books, formId]);
  const visibleBooks = useMemo(() => books.filter((book) => {
    if (view === "Library" && filter === "Reading" && book.status !== "reading") return false;
    if (view === "Library" && filter === "Finished" && book.status !== "finished") return false;
    const needle = query.trim().toLocaleLowerCase();
    return !needle || [book.title, book.author, book.current_section, book.note].some((value) => value?.toLocaleLowerCase().includes(needle));
  }), [books, filter, query, view]);
  const reading = books.filter((book) => book.status === "reading");
  const finished = books.filter((book) => book.status === "finished");
  const average = books.length ? Math.round(books.reduce((sum, book) => sum + progressFor(book), 0) / books.length) : 0;
  const withBookmark = books.filter((book) => book.current_page || book.current_section).length;

  function openDetail(book: Book) { setDetailId(book.id); setDetailOpen(true); }
  function openForm(id: string | null) { setDetailOpen(false); setFormId(id); setFormOpen(true); }
  function openLocation(book: Book) { setDetailOpen(false); setLocationId(book.id); setLocationOpen(true); }
  function updateStatus() {
    if (!selected) return;
    const next = selected.status === "reading" ? "finished" : "reading";
    startTransition(async () => {
      const result = await changeBookStatus(selected.id, next);
      if (result.success) { toast.success(t(result.message)); setDetailOpen(false); }
      else toast.error(t(result.message));
    });
  }
  function removeBook() {
    if (!selected || !window.confirm(t("Remove “{title}” from your library?", { title: selected.title }))) return;
    startTransition(async () => {
      const result = await deleteBook(selected.id);
      if (result.success) { toast.success(t(result.message)); setDetailOpen(false); }
      else toast.error(t(result.message));
    });
  }

  const addButton = <Button onClick={() => openForm(null)} className="gap-2"><Plus className="size-4"/>{t("Add book")}</Button>;
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/70 bg-card px-6 py-7 md:flex">
        <Brand className="mb-12"/>
        <nav aria-label={t("Main navigation")} className="grid gap-1">{navigation.map(({ name, icon: Icon }) => <NavButton key={name} name={name} current={view === name} icon={<Icon className="size-4"/>} onClick={() => setView(name)}/>)}</nav>
        <div className="mt-auto border-t border-border/70 pt-5"><LanguageSelector/><UserMenu email={email}/></div>
      </aside>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur md:hidden"><Brand className="min-w-0"/><div className="flex shrink-0 items-center gap-1"><Button size="icon" onClick={() => openForm(null)} aria-label={t("Add book")} title={t("Add book")} className="rounded-full"><Plus className="size-5"/></Button><UserMenu email={email}/></div></header>
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-7 md:ml-64 md:px-10 md:pb-12 md:pt-10">
        <div className="mb-8 hidden items-center justify-between md:flex"><p className="text-sm text-muted-foreground">{t("A little progress, a lot of stories.")}</p>{addButton}</div>
        {configured === false && <div className="mb-6"><SetupNotice/></div>}
        {loadError && <p role="alert" className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{t("Your library could not be loaded. Refresh the page to try again.")}</p>}
        {view === "Library" && <>
          <section className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 sm:mb-8"><div><p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary/70 uppercase">{t("Your reading corner")}</p><h1 className="editorial text-3xl font-semibold sm:text-4xl">{t("A shelf of your own.")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("Every story, right where you left it.")}</p></div><p className="text-sm text-muted-foreground">{bookCount(locale, books.length)}</p></section>
          <div className="no-scrollbar -mx-4 mb-6 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label={t("Filter books")}>{(["All books", "Reading", "Finished"] as const).map((item) => <Button key={item} variant={filter === item ? "secondary" : "ghost"} size="sm" className="snap-start rounded-full" onClick={() => setFilter(item)} aria-pressed={filter === item}>{t(item)}{item === "All books" ? ` · ${books.length}` : item === "Reading" ? ` · ${reading.length}` : ` · ${finished.length}`}</Button>)}</div>
          <BookGrid books={visibleBooks} onOpen={openDetail} onAdd={() => openForm(null)} emptyLabel={filter === "All books" ? t("Your shelves are waiting") : t(filter === "Reading" ? "No reading books yet" : "No finished books yet")}/>
        </>}
        {view === "Search" && <section><PageHeading eyebrow={t("Find your place")} title={t("Search your shelf.")}/><div className="relative mb-7 max-w-lg"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" type="search" placeholder={t("Title, author, chapter, or note…")} value={query} onChange={(event) => setQuery(event.target.value)} aria-label={t("Search books")}/></div><BookGrid books={visibleBooks} onOpen={openDetail} onAdd={() => openForm(null)} emptyLabel={query ? t("No books match that search") : t("Add a book to start searching")}/></section>}
        {view === "Stats" && <section><PageHeading eyebrow={t("Your reading life")} title={t("Stories in progress.")}/><div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">{[["On your shelf", books.length], ["Currently reading", reading.length], ["Finished", finished.length], ["Average progress", `${average}%`]].map(([label, value]) => <div key={label} className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5"><p className="text-sm text-muted-foreground">{t(String(label))}</p><p className="editorial mt-2 text-3xl font-semibold sm:mt-3 sm:text-4xl">{value}</p></div>)}</div><div className="mt-3 rounded-2xl border border-border/70 bg-card p-4 sm:mt-6 sm:p-5"><p className="text-sm text-muted-foreground">{t("Bookmarks saved")}</p><p className="editorial mt-2 text-3xl font-semibold">{withBookmark} <span className="text-base font-normal text-muted-foreground">{t("of {count} books", { count: books.length })}</span></p></div></section>}
        {view === "Profile" && <section><PageHeading eyebrow={t("Your account")} title={t("A reader, always.")}/><div className="mt-6 max-w-lg rounded-2xl border border-border/70 bg-card p-5 sm:mt-8 sm:p-6"><p className="text-sm text-muted-foreground">{t("Signed in as")}</p><p className="mt-1 break-all font-medium">{email || t("Guest reader")}</p><div className="mt-6"><UserMenu email={email}/></div></div></section>}
      </main>
      <nav aria-label={t("Main navigation")} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t border-border/70 bg-card/95 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">{navigation.map(({ name, icon: Icon }) => <NavButton key={name} name={name} current={view === name} icon={<Icon className="size-5"/>} onClick={() => setView(name)} mobile/>)}</nav>
      <BookDetailDialog book={selected} progress={selected ? progressFor(selected) : 0} open={detailOpen} onOpenChange={setDetailOpen} onEdit={() => selected && openForm(selected.id)} onLocation={() => selected && openLocation(selected)} onStatus={updateStatus} onDelete={removeBook}/>
      <BookFormDialog book={editingBook} open={formOpen} onOpenChange={setFormOpen}/>
      <LocationDialog book={locationBook} open={locationOpen} onOpenChange={setLocationOpen}/>
      {pending && <span className="sr-only" role="status">{t("Saving changes…")}</span>}
    </div>
  );
}

function NavButton({ name, current, icon, onClick, mobile = false }: { name: View; current: boolean; icon: React.ReactNode; onClick: () => void; mobile?: boolean }) {
  const { t } = useI18n();
  return <button type="button" onClick={onClick} aria-current={current ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors", mobile ? "min-h-14 min-w-0 touch-manipulation flex-col justify-center gap-1 px-1 py-1.5 text-[11px] leading-none" : "w-full", current ? "bg-secondary font-medium text-primary" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")}>{icon}<span className={mobile ? "max-w-full truncate" : undefined}>{t(name)}</span></button>;
}

function PageHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary/70 uppercase">{eyebrow}</p><h1 className="editorial text-3xl font-semibold sm:text-4xl">{title}</h1></div>;
}

function BookGrid({ books, onOpen, onAdd, emptyLabel }: { books: Book[]; onOpen: (book: Book) => void; onAdd: () => void; emptyLabel: string }) {
  const { t } = useI18n();
  if (!books.length) return <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center"><BookOpen className="mx-auto size-8 text-primary/60"/><h2 className="editorial mt-4 text-xl font-semibold">{emptyLabel}</h2><p className="mt-2 text-sm text-muted-foreground">{t("Add a book and keep your next chapter close.")}</p><Button onClick={onAdd} variant="outline" className="mt-5 gap-2"><Plus className="size-4"/>{t("Add a book")}</Button></div>;
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">{books.map((book) => <BookCard key={book.id} book={book} progress={progressFor(book)} onOpen={() => onOpen(book)}/>)}</div>;
}
