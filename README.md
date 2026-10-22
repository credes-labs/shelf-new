# Shelf

Shelf is a two-app project:

| App | Folder | Stack | Local URL |
|---|---|---|---|
| Marketing site + waitlist | `/` | Next.js 13.5 (App Router), React 18 | `http://localhost:3000` |
| Blog CMS (Payload 3) | `cms/` | Next.js 16, React 19, Payload 3.91 | `http://localhost:3001/admin` |

Both apps share one Supabase Postgres database:

- the waitlist lives in the `public` schema;
- Payload's tables live in a separate `payload` schema, which Supabase's REST
  API does not expose.

The CMS is a separate app because Payload 3 requires Next 15+/React 19 while
the marketing site stays on Next 13.5/React 18.

**For production setup, ownership, and the deployment checklist, read
[`HANDOFF.md`](./HANDOFF.md).** This file is the local development guide.

## Architecture at a glance

```text
site (Vercel, repo root)              CMS (Vercel, cms/)
  |                                     |
  |-- /api/waitlist -> Supabase RPC ---> public.waitlist_submissions
  |                                     |
  |<-- Payload REST / ISR ------------- payload schema
  |                                     |
  +<-- /api/revalidate (shared secret) -+
                                        |
                              Supabase Storage (media)
```

- The site never talks to Postgres directly for the waitlist. It calls the
  `waitlist_join` RPC with a server-side anon key.
- The site never uses Supabase's REST API for blog content. It fetches the CMS
  REST API over HTTP.
- The CMS connects to Postgres with a database connection string. Its tables
  are not reachable with the Supabase anon key.
- Published posts call the site's `/api/revalidate` webhook so changes appear
  without waiting for the ISR window.

## Quick start

Requirements: Node.js 20.18+ (24 recommended), npm, and a Postgres/Supabase
database.

```bash
git clone https://github.com/elyashium/shelf.git
cd shelf
npm install
npm run cms:install
```

### 1. Create the database tables

Create a Supabase project, then run the waitlist migrations in order in the
Supabase SQL Editor:

- `supabase/migrations/20260930182335_create_waitlist_submissions.sql`
- `supabase/migrations/20261022140000_waitlist_profile_fields.sql`
- `supabase/migrations/20261023120000_waitlist_referrals_and_positions.sql`

The latest migration adds waitlist positions, referral codes, case-insensitive
email uniqueness, and the atomic `waitlist_join(...)` RPC. The files are
idempotent.

### 2. Configure the site

```bash
cp .env.example .env.local
```

Fill in the server-side Supabase values. The current waitlist API only needs
`SUPABASE_URL` and `SUPABASE_ANON_KEY`; the public copies are optional unless a
browser-side client is added later. Keep `PAYLOAD_URL` empty to render the
bundled fallback articles, or set it once the CMS is running.

### 3. Configure and seed the CMS

```bash
cd cms
cp .env.example .env
```

Set `DATABASE_URL` (Supabase -> Project Settings -> Database -> connection
string; use the session pooler or direct connection), generate
`PAYLOAD_SECRET` with `openssl rand -hex 32`, and set `SITE_URL` plus
`REVALIDATE_SECRET` (the same secret goes in the site env). See
[`cms/README.md`](./cms/README.md) for the collection and media details.

```bash
cd ..
npm run cms:migrate   # creates the payload schema + tables
npm run cms:seed      # optional: imports the starter articles and covers
npm run cms:dev       # http://localhost:3001/admin
```

The first visit to `/admin` asks you to create an admin user. Alternatively,
set `PAYLOAD_SEED_EMAIL` / `PAYLOAD_SEED_PASSWORD` before running the seed.

### 4. Run both apps

```bash
npm run dev       # site  -> http://localhost:3000
npm run cms:dev   # CMS   -> http://localhost:3001/admin
```

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment

### Site (`.env.local`)

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, social images, and referral links |
| `SUPABASE_URL` | Server-side waitlist route |
| `SUPABASE_ANON_KEY` | Server-side waitlist RPC; least-privilege anon/publishable key |
| `SUPABASE_PUBLISHABLE_KEY` | Alternative name for the same Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional server-only fallback; not needed for the waitlist |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional public copies; only if a browser-side client is added |
| `PAYLOAD_URL` | Blog data. Empty = bundled fallback articles |
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
| `S3_BUCKET` / `S3_ENDPOINT` / `S3_REGION` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Optional local, required in production for Supabase Storage uploads |
| `SUPABASE_PUBLIC_MEDIA_URL` | Public bucket URL used to build media links |

Never commit secrets. `.env*` is gitignored; only `NEXT_PUBLIC_*` vars are
visible in the browser, and the server-only keys must stay server-side.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Site on port 3000 |
| `npm run build` / `start` | Build and serve the site |
| `npm run cms:install` | Install the CMS package |
| `npm run cms:dev` | CMS on port 3001 |
| `npm run cms:migrate` | Apply Payload migrations |
| `npm run cms:seed` | Import starter content (idempotent) |
| `npm run cms:seed:force` | Import and overwrite starter content |
| `npm run cms:types` | Regenerate Payload types |
| `npm run typecheck` / `lint` | Site checks |

## Content and revalidation

Payload collections:

- **Posts** — drafts, Lexical body, cover image, category, tags, author,
  publish date, computed reading time, featured flag, series note, SEO.
- **Media** — required alt text, caption, credit, focal point, and three image
  sizes.
- **Categories** — title, slug, description.
- **Users** — admin accounts.

The site reads Payload over REST with ISR. If `PAYLOAD_URL` is missing or the
CMS is unreachable, it renders `lib/blog-fallback.ts`. A reachable but empty CMS
shows an empty blog; the fallback only covers outages.

After a post changes, the CMS posts `{ slug }` to
`${SITE_URL}/api/revalidate` with the `x-revalidate-secret` header. The site
clears the `blog` cache tag and the affected pages. If the site is offline, the
save still succeeds and the next ISR window catches up.

### Media

Local uploads are written to `cms/media` and served by the CMS. Vercel's
filesystem is ephemeral/read-only, so production uses Supabase Storage:

1. Supabase -> Storage -> create a **public** bucket, e.g. `shelf-media`.
2. Project Settings -> Storage -> S3 access keys -> create a key.
3. In `cms/.env` set `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`,
   `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and
   `SUPABASE_PUBLIC_MEDIA_URL`.

The exact values and the production checklist are in
[`HANDOFF.md`](./HANDOFF.md).

## Deploy

The short version:

- **Site** — import the repo as a Vercel project from the root, add the site env
  vars, deploy.
- **CMS** — create a second Vercel project from the same repo with **Root
  Directory = `cms`**, add the CMS env vars, apply Payload migrations to the
  production database once, then deploy.

Do not enable `PAYLOAD_DB_PUSH` on a shared or production database. Full steps,
environment tables, and sign-off checks are in [`HANDOFF.md`](./HANDOFF.md).

## Project structure

```text
app/
  layout.tsx              Root layout: fonts, UI sound, globals.css
  page.tsx                Homepage hero (desktop + mobile story)
  globals.css             Hero, story, waitlist, blog styles
  blog/page.tsx           Blog index, CMS-backed with bundled fallback
  blog/[slug]/page.tsx    Article page, cover, prev/next, JSON-LD
  api/waitlist/route.ts   POST signups / GET count
  api/revalidate/route.ts CMS -> site ISR webhook
components/
  RichText.tsx            Renders Payload Lexical JSON
  WaitlistSignup.tsx      Join button, inline form, success card
  WaitlistForm.tsx        Form fields, validation, submit state
  WaitlistProof.tsx       Avatar stack + live counter
  ReferralCapture.tsx     Stores ?ref= codes
  SiteHeader.tsx / StaggeredMenu.tsx
  BrickFooter.tsx         Mobile brick-puzzle footer
lib/
  payload.ts              CMS client, normalization, fallback content
  blog-fallback.ts        Bundled articles used when the CMS is not configured
  lexical.ts              Lexical types + block conversion
  media.ts                Resolves relative Payload media URLs
  waitlist-client.ts      Saved signup/referral localStorage helpers
cms/                      Payload 3 admin + REST/GraphQL API
  src/collections/        Posts, Media, Categories, Users
  src/migrations/         Committed Postgres migrations
  src/seed.ts             Idempotent seed: articles, covers, first admin
supabase/
  migrations/             Waitlist schema, RLS, count/join RPCs
```

## Conventions

- Mobile hero/footer CSS lives behind `@media (max-width: 900px)` in
  `app/globals.css`; desktop uses `@media (min-width: 901px)`. Keep the tracks
  independent.
- The mobile story is budget-driven (`--story-*` variables in
  `.mobile-story-step`): the phone is sized from its art row so it cannot grow
  into the headline.
- `cms/` is a self-contained npm package. The root TypeScript, ESLint, and Next
  build exclude it; use the `cms:*` scripts.
- The hero keeps each phone screen sharp for most of its scroll segment. The
  handoff is compressed into the last 22% (`FAST_TRANSITION_START = 0.78`) with
  a short 4.5px blur peak; the mobile story drops the blur and keeps the faster
  crossfade.
