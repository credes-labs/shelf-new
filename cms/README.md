# Shelf CMS

Payload 3.91 admin and content API for the Shelf blog. It is a standalone
Next.js 16 app; the marketing site (Next 13.5) consumes it over REST.

- Admin: `http://localhost:3001/admin`
- REST API: `http://localhost:3001/api/posts`
- GraphQL: `http://localhost:3001/api/graphql`

Both apps share one Supabase Postgres database. Payload writes to the
`payload` schema, so its tables are not exposed by Supabase's `public` REST API.
The waitlist stays in `public`. See [`../HANDOFF.md`](../HANDOFF.md) for the
production setup, credential ownership, and deployment checklist.

## Requirements

- Node.js 20.18+ (24 recommended)
- A Postgres database (Supabase works; direct connection or session pooler)

## Setup

```bash
cp .env.example .env
```

Required values:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → **Session pooler** string (port 5432, user `postgres.<ref>`) |
| `PAYLOAD_SECRET` | Long random string (`openssl rand -hex 32`) |
| `PAYLOAD_PUBLIC_SERVER_URL` | `http://localhost:3001` locally, the CMS URL in production |
| `SITE_URL` | Where the site runs; used for links and cache revalidation |
| `REVALIDATE_SECRET` | Same value as the site's `REVALIDATE_SECRET` |

Then install, migrate and seed:

```bash
npm install
npm run migrate   # applies src/migrations (creates the payload schema)
npm run seed      # optional: imports the two starter articles + covers
npm run dev
```

Open `/admin`. If no user exists, Payload asks you to create the first admin.
To automate that, set `PAYLOAD_SEED_EMAIL` and `PAYLOAD_SEED_PASSWORD` before
running the seed; it creates the account only when the users table is empty.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` / `start` | Production build / server |
| `npm run seed` | Idempotent content seed |
| `npm run seed:force` | Same, but overwrites existing posts |
| `npm run migrate` | Apply committed migrations |
| `npm run migrate:create` | Generate a migration after changing collections |
| `npm run generate:types` | Regenerate `src/payload-types.ts` |
| `npm run generate:importmap` | Regenerate the admin import map after adding components |

## Collections

- **Posts** — title, slug (auto from title), excerpt, cover image, category,
  tags, author, publish date, computed reading time, featured flag, series note,
  Lexical body. Drafts are enabled; the public API only returns published posts.
- **Media** — required alt text, caption, credit, focal point, thumbnail/card/hero
  sizes.
- **Categories** — title, slug, description.
- **Users** — admin accounts.

The SEO plugin adds a `meta` group (`title`, `description`, `image`) to posts.
Drafts are saved as versions and can be published from the admin.

## Media storage

Locally, uploads go to `media/` and are served from
`/api/media/file/<filename>`.

Vercel's filesystem is ephemeral, so use Supabase Storage in production. In the
Supabase dashboard:

1. Storage → create a public bucket, e.g. `shelf-media`.
2. Project Settings → Storage → S3 access keys → create a key.
3. Set:

```env
S3_BUCKET=shelf-media
S3_ENDPOINT=https://<ref>.supabase.co/storage/v1/s3
S3_REGION=<region shown in the dashboard>
S3_ACCESS_KEY_ID=<key id>
S3_SECRET_ACCESS_KEY=<secret>
SUPABASE_PUBLIC_MEDIA_URL=https://<ref>.supabase.co/storage/v1/object/public/shelf-media
```

When the four `S3_*` credentials are present the S3 adapter is enabled and
`SUPABASE_PUBLIC_MEDIA_URL` builds the public links. Without them, local disk is
used.

## Migrations

The `payload` schema and all tables are created by
`src/migrations/20261022_134212_initial.ts`. Apply it with `npm run migrate`; the
migration creates the schema itself, so it works on a fresh database.

When you change a collection:

```bash
npm run migrate:create
npm run migrate
```

Keep `PAYLOAD_DB_PUSH` unset in shared/production databases. It exists only for
throwaway local prototyping and should not be mixed with a migrated database.

## Revalidation

After a post is created, updated or deleted, the collection hook posts
`{ slug }` to `${SITE_URL}/api/revalidate` with the
`x-revalidate-secret` header. The site clears its `blog` cache tag and rebuilds
the affected pages. If the site is offline the save still succeeds; the CMS logs
a warning and the site picks the change up on its next ISR window.

## Deploy

Create a Vercel project with **Root Directory** set to `cms`, add the env vars
above, and deploy. Node 20.18+ is required. Run `npm run migrate` once against
the production database (from your machine or a one-off job), then create the
first admin at `/admin` or run `npm run seed`.
