# <img src="https://github.com/user-attachments/assets/51eae049-6905-487b-a0d5-b8e35062cf77" width="32" alt="Shelf logo" /> Shelf


<img width="3838" height="2156" alt="image" src="https://github.com/user-attachments/assets/595a8ec0-b8e6-4068-9374-314f59e24f74" />


Shelf is a two-app project:

| App | Folder | Stack | Runs on |
|---|---|---|---|
| Marketing site + waitlist | `/` | Next.js 13.5 (App Router), React 18 | `http://localhost:3000` |
| Blog CMS (Payload 3) | `cms/` | Next.js 16, React 19, Payload 3.91 | `http://localhost:3001` |

Both use the same Supabase Postgres database. The waitlist lives in the `public`
schema; Payload's tables live in a separate `payload` schema, which Supabase's
REST API does not expose. The CMS is a separate app because Payload 3 requires
Next 15+ / React 19, while the site stays on Next 13.5 / React 18.

## Quick start

```bash
git clone https://github.com/elyashium/shelf.git
cd shelf
npm install
npm run cms:install
```

### 1. Create the database tables

Run the two migrations in order, either in the Supabase dashboard SQL editor or
with the Supabase CLI:

```bash
supabase link --project-ref <ref>
supabase db push
```

- `supabase/migrations/20260930182335_create_waitlist_submissions.sql` — waitlist table + RLS
- `supabase/migrations/20261022140000_waitlist_profile_fields.sql` — signup profile fields, private counter RPC

### 2. Configure the site

```bash
cp .env.example .env.local
```

Fill in the Supabase values. Keep `PAYLOAD_URL` empty to render the two bundled
articles; set it once the CMS is running.

### 3. Configure and seed the CMS

```bash
cd cms
cp .env.example .env
```

Set `DATABASE_URL` (Supabase → Project Settings → Database → Connection string;
use the direct or session-pooler URL), generate `PAYLOAD_SECRET` with
`openssl rand -hex 32`, and set `SITE_URL` + `REVALIDATE_SECRET` (the same secret
goes in the site env).

```bash
cd ..
npm run cms:migrate   # creates the payload schema + tables
npm run cms:seed      # imports the two existing articles and their cover art
npm run cms:dev       # http://localhost:3001/admin
```

The first visit to `/admin` asks you to create an admin user. Alternatively set
`PAYLOAD_SEED_EMAIL` / `PAYLOAD_SEED_PASSWORD` before running the seed and it
will create that account for you.

### 4. Run both apps

```bash
npm run dev       # site  → http://localhost:3000
npm run cms:dev   # CMS   → http://localhost:3001/admin
```

```bash
npm run typecheck
npm run lint
npm run build
```

## Project structure

```
app/
  layout.tsx              Root layout: fonts, UiSoundManager, globals.css
  page.tsx                Homepage hero (desktop .hero-stage + mobile .mobile-story)
  globals.css             Global styles: hero, story, waitlist, blog
  blog/page.tsx           Blog index — CMS-backed with a bundled fallback
  blog/[slug]/page.tsx    Article page, cover, prev/next, JSON-LD
  api/waitlist/route.ts   POST signups → Supabase · GET join count
  api/revalidate/route.ts CMS → site ISR webhook
components/
  RichText.tsx            Renders Payload's Lexical JSON (no Payload runtime)
  WaitlistSignup.tsx      Join button + modal form + success card
  WaitlistProof.tsx       Avatar stack + live counter
  SiteHeader.tsx / StaggeredMenu.tsx     Nav + mobile menu
  ModalPeels.tsx / StickerPeel.tsx / StickerScatter.tsx  Popup sticker effects
  BrickFooter.tsx (+ .module.css)  Mobile brick-puzzle footer
lib/
  payload.ts              CMS client, normalization, fallback content
  blog-fallback.ts        Bundled articles used when the CMS is not configured
  lexical.ts              Lexical types + block → Lexical conversion
  media.ts                Resolves relative Payload media URLs
  bricks.ts / useBrickDrag.ts / ui-sound.ts / utils.ts
cms/                      Payload 3 admin + REST/GraphQL API (own package)
  src/collections/        Posts, Media, Categories, Users
  src/migrations/         Committed Postgres migrations
  src/seed.ts             Idempotent seed: articles, covers, first admin
supabase/
  migrations/             Waitlist schema + RLS + count RPC
```

## Environment

### Site (`.env.local`)

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata and social images |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client / waitlist API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Waitlist insert + count fallback |
| `SUPABASE_URL` | Server-side waitlist route (falls back to the public URL) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional; bypasses RLS on writes. Never expose it |
| `PAYLOAD_URL` | Blog data. Empty ⇒ bundled fallback articles |
| `PAYLOAD_REVALIDATE_SECONDS` | ISR window for blog fetches (default `60`) |
| `REVALIDATE_SECRET` | Shared secret for `POST /api/revalidate` |

### CMS (`cms/.env`)

| Variable | Used by |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string |
| `PAYLOAD_SECRET` | Payload auth/signing secret (required in production) |
| `PAYLOAD_PUBLIC_SERVER_URL` | Public CMS origin, e.g. `https://cms.example.com` |
| `SITE_URL` | Site origin the CMS revalidates and links to |
| `REVALIDATE_SECRET` | Must match the site |
| `PAYLOAD_SEED_EMAIL` / `PAYLOAD_SEED_PASSWORD` | Optional first admin for `cms:seed` |
| `PAYLOAD_DB_PUSH` | Set `true` only for throwaway prototyping. Keep migrations authoritative |
| `S3_BUCKET` / `S3_ENDPOINT` / `S3_REGION` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Optional Supabase Storage uploads |
| `SUPABASE_PUBLIC_MEDIA_URL` | Public bucket URL used to build media links |

Never commit secrets — `.env*` is gitignored. Only `NEXT_PUBLIC_*` vars are
visible in the browser; keep the service-role key server-side.

## Content

- Payload collections: **Posts** (drafts, Lexical body, cover image, category,
  tags, author, publish date, reading time, featured, series note, SEO),
  **Media** (required alt, caption, credit, focal point, three image sizes),
  **Categories**, and **Users**.
- The site reads Payload over REST with ISR. If `PAYLOAD_URL` is missing or the
  CMS is unreachable, it renders `lib/blog-fallback.ts` instead. A reachable but
  empty CMS shows an empty blog — fallback only covers outages.
- Saving a post calls `POST /api/revalidate` on the site, which clears the
  `blog` cache tag and the affected pages immediately.
- Media in local development is written to `cms/media` and served by the CMS.
  On Vercel the filesystem is ephemeral/read-only, so configure Supabase Storage
  (S3 protocol) for deployed media:

  1. Supabase → Storage → create a **public** bucket named `shelf-media`.
  2. Project Settings → Storage → S3 access keys → create a key.
  3. In `cms/.env` set `S3_BUCKET=shelf-media`,
     `S3_ENDPOINT=https://<ref>.supabase.co/storage/v1/s3`, the region shown in
     the dashboard, the key pair, and
     `SUPABASE_PUBLIC_MEDIA_URL=https://<ref>.supabase.co/storage/v1/object/public/shelf-media`.

## Deploy (Vercel)

**Site** — import the repo, add the site env vars, deploy. Set `PAYLOAD_URL` to
the CMS URL once it exists.

**CMS** — create a second Vercel project from the same repo with **Root
Directory = `cms`**. Add the CMS env vars, point `PAYLOAD_PUBLIC_SERVER_URL` at
the CMS project URL and `SITE_URL` at the site, then deploy. Apply the Payload
migrations to the production database once from your machine:

```bash
cd cms
# with production DATABASE_URL in .env
npm run cms:migrate
```

Then either open `/admin` to create the first user, or run `npm run cms:seed`
once to import the starter content. Do not enable `PAYLOAD_DB_PUSH` on the
production database.

## Conventions

- Mobile hero/footer CSS lives behind `@media (max-width: 900px)` in
  `app/globals.css`; desktop uses `@media (min-width: 901px)`. Keep the tracks
  independent — desktop ships no footer.
- Mobile story layout is budget-driven (`--story-*` vars in `.mobile-story-step`):
  the phone is sized from its art row so it can never grow into the headline;
  the copy reserve is shared so the phone keeps one size across panels.
- `cms/` is a self-contained npm package. The root `tsconfig`, ESLint and Next
  build exclude it; use the `cms:*` scripts instead of installing its
  dependencies at the root.
- Never commit: `node_modules/`, `.next/`, `.env*`, CMS uploads
  (`cms/media/`), agent workspaces (`.claude/`, `.next-codex-verify-*/`) — all
  in `.gitignore`.
