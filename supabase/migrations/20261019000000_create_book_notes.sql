begin;

create table public.book_notes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  reference_type text not null check (reference_type in ('page', 'range', 'reference', 'pending')),
  page_start integer check (page_start between 1 and 1000000),
  page_end integer check (page_end between 1 and 1000000),
  reference text check (char_length(trim(reference)) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint note_location check (
    (reference_type = 'page' and page_start is not null and page_end is null and reference is null)
    or (reference_type = 'range' and page_start is not null and page_end is not null and page_end > page_start and reference is null)
    or (reference_type = 'reference' and page_start is null and page_end is null and reference is not null)
    or (reference_type = 'pending' and page_start is null and page_end is null and reference is null)
  )
);

-- Historical notes have no reliable location. Preserve them without guessing one.
insert into public.book_notes (book_id, user_id, content, reference_type, created_at, updated_at)
select id, user_id, note, 'pending', created_at, updated_at
from public.books where note is not null and char_length(trim(note)) > 0;

create index book_notes_user_book_created_idx on public.book_notes (user_id, book_id, created_at desc, id);
alter table public.book_notes enable row level security;
revoke all on public.book_notes from anon, authenticated;
grant select, insert, update, delete on public.book_notes to authenticated;

create policy "Read own notes" on public.book_notes for select to authenticated
  using ((select auth.uid()) = user_id and exists (
    select 1 from public.books where books.id = book_id and books.user_id = (select auth.uid())
  ));
create policy "Create own notes" on public.book_notes for insert to authenticated
  with check ((select auth.uid()) = user_id and exists (
    select 1 from public.books where books.id = book_id and books.user_id = (select auth.uid())
  ));
create policy "Update own notes" on public.book_notes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and exists (
    select 1 from public.books where books.id = book_id and books.user_id = (select auth.uid())
  ));
create policy "Delete own notes" on public.book_notes for delete to authenticated
  using ((select auth.uid()) = user_id);

create function public.validate_book_note() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Only the one-time migration may create an unlocated note.
  if new.reference_type = 'pending' then
    raise exception 'A note location is required.' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' then
    new.id = old.id;
    new.book_id = old.book_id;
    new.user_id = old.user_id;
    new.created_at = old.created_at;
    new.updated_at = now();
  end if;
  return new;
end;
$$;

create trigger validate_book_note before insert or update on public.book_notes
  for each row execute function public.validate_book_note();

alter table public.books drop column note;

commit;
