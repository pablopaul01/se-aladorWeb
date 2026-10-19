This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Independent book notes

Before running this version against an existing Supabase database, apply
`supabase/migrations/20261019000000_create_book_notes.sql` using your migration
workflow or the Supabase SQL editor, followed by
`supabase/migrations/20261019010000_allow_combined_note_locations.sql`. If the
first migration is already applied, run only the second one. For a new database,
apply all files in `supabase/migrations/` in filename order.

Back up the database first and coordinate the migration with deployment: it moves
existing `books.note` values into `book_notes` and removes the old column, so older
application versions are not compatible with the migrated schema.

Open a book and use **Add note** to create multiple notes without changing reading
progress. Every new or edited note requires a page, a range whose end is greater
than its start, or a nonempty free-text section/reference. A page or range can
also be combined with a section/reference (for example, page 114 and Chapter 4).
Selecting a page excludes a page range, but does not exclude a text reference.
Historical notes are preserved as **Location pending** until you assign a
location when editing them. Deleting a book also deletes its notes.

Run validation and browser tests with:

```bash
pnpm exec tsx --test tests/*.test.ts
pnpm exec playwright test
```

Browser tests use an isolated mock Supabase service, not your database. If the
Playwright browser is unavailable, use an installed browser via
`PLAYWRIGHT_BROWSER_CHANNEL=msedge` or install Playwright's Chromium. These tests
do not verify database policies or execute migrations against PostgreSQL.

First, run the development server:

```bash
pnpm dev
# or
pnpm build
# or
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
