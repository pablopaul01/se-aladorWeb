create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 200),
  author text check (char_length(author) <= 200),
  total_pages integer check (total_pages between 1 and 1000000),
  current_page integer check (current_page between 1 and 1000000),
  current_section text check (char_length(current_section) <= 200),
  note text check (char_length(note) <= 2000),
  status text not null default 'reading' check (status in ('reading', 'finished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint page_within_book check (current_page is null or total_pages is null or current_page <= total_pages)
);

create index books_user_updated_idx on public.books (user_id, updated_at desc);

alter table public.books enable row level security;

revoke all on public.books from anon, authenticated;
grant select, insert, update, delete on public.books to authenticated;

create policy "Read own books" on public.books for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Create own books" on public.books for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Update own books" on public.books for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Delete own books" on public.books for delete to authenticated
  using ((select auth.uid()) = user_id);

create function public.set_book_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  new.created_at = old.created_at;
  return new;
end;
$$;

create trigger set_book_updated_at before update on public.books
  for each row execute function public.set_book_updated_at();
