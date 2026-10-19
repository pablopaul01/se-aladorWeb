begin;

-- A numeric location is either a page or a range. A text reference can
-- accompany either one, or provide the location on its own.
alter table public.book_notes drop constraint note_location;
alter table public.book_notes add constraint note_location check (
  (reference_type = 'page' and page_start is not null and page_end is null)
  or (reference_type = 'range' and page_start is not null and page_end is not null and page_end > page_start)
  or (reference_type = 'reference' and page_start is null and page_end is null and reference is not null)
  or (reference_type = 'pending' and page_start is null and page_end is null and reference is null)
);

commit;
