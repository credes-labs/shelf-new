# Shelf production handoff

This is the runbook for putting Shelf online and handing it to an owner. It
covers the marketing site, the Payload CMS, Supabase, and the production
checks to run before calling it done.

> **Current status:** the site and CMS are implemented and pass local QA. The
> new Supabase project is `https://gcspqnjoyaokhirkgrfh.supabase.co`
> (`ap-southeast-1`). Its URL and publishable key are wired into the site env,
> all three waitlist migrations have been applied, and the Payload schema plus
> the S3 media migration have been applied. The CMS is running locally at
> `http://localhost:3001/admin`; starter posts and covers are seeded, and media
> is served from the public `shelf-media` bucket. Production still needs the two
> Vercel projects and final domains; copy-paste env files are ready locally.
> Do not try to reuse the old `twofxxgidvugywfmgvwa` project.

### Ready-to-paste production env files

These are local, git-ignored files with the live project values:

| File | Use |
|---|---|
| `.env.production` | Site/Vercel production env |
| `cms/.env.production` | CMS/Vercel production env (Root Directory = `cms`) |

Replace `https://shelf.example.com` and `https://cms.shelf.example.com` in both
files once the Vercel domains are assigned. Do not commit either file. For local
`next start`, `cms/.env.local` overrides the local URLs/secrets.

---

## 1. What runs where

| Piece | Host | Purpose |
|---|---|---|
| Marketing site + waitlist API | Vercel project, repo root | Public pages, `/api/waitlist`, blog UI |
| Payload CMS | A second Vercel project, root directory `cms` | Editors write blog posts and upload media |
| Supabase | One project | Postgres for both apps + public media bucket |
| Domain/DNS | Registrar or Vercel DNS | `shelf.example.com` and `cms.shelf.example.com` |

> **Hosting decision:** this runbook uses Vercel. The repo still contains a
> `netlify.toml` from an earlier experiment; it is not part of the final
> deployment path and can be removed once Vercel is confirmed.

### The data flow

```text
Visitor
  -> site /api/waitlist
  -> Supabase RPC public.waitlist_join(...)
  -> public.waitlist_submissions

Editor
  -> CMS /admin
  -> Payload API / Postgres `payload` schema

Site
  -> CMS REST API (server-side fetch, ISR)
  -> blog pages

CMS after save
  -> site /api/revalidate (shared secret)
  -> Next.js cache cleared immediately

CMS media upload
  -> Supabase Storage bucket (S3 protocol)
```

### Why two apps but one database

- Payload 3 needs Next 15+/React 19. The marketing site is Next 13.5/React 18.
  They cannot share one Next app without a risky framework upgrade.
- Both apps can still share one Supabase Postgres database. The waitlist uses
  the `public` schema. Payload owns a separate `payload` schema and connects
  with the database connection string, not with Supabase's REST API.
- Supabase's REST API only exposes `public` (and `graphql_public`) by default.
  The `payload` tables are **not** reachable with the anon key.
- One project means one database backup, one storage account, one Supabase
  bill, and one set of project owners. Splitting into two projects adds cost
  and operational work without helping this site.

### What the CMS does and does not manage

**In the CMS:** blog posts, drafts, cover images, media, categories, and admin
users.

**Not in the CMS:** waitlist signups. Waitlist rows contain personal data and
are intentionally kept out of the content admin. Use the Supabase dashboard or
a server-side/service-role export when the team needs the list. Do not give the
CMS admin a direct path to the waitlist table.

---

## 2. Accounts and access the owner needs

Before deployment, make sure the owner controls these accounts (not only the
developer's personal account):

- [ ] GitHub repository and the production branch
- [ ] Vercel team, with both projects transferred into it
- [ ] Supabase organization/project
- [ ] Domain registrar and DNS
- [ ] Billing for Vercel, Supabase, and the domain

Create at least two CMS admin users. Do not leave a shared seed password as the
only admin account.

---

## 3. Supabase project and database

The project for this build is `gcspqnjoyaokhirkgrfh` in `ap-southeast-1`, and
both the waitlist and Payload schemas have already been created there. Use the
steps below if you need to recreate the project or set up a second environment.

1. In Supabase, create a project in the region closest to the audience.
2. Save the database password in the team password manager.
3. From **Project Settings -> API**, record:
   - Project URL
   - `anon` public key, or the newer **publishable key** (`sb_publishable_...`)
   - `service_role` key (optional; keep it server-only)
4. From **Project Settings -> Database**, copy the **session pooler**
   connection string (port `5432`). Use this for Payload. Avoid the transaction
   pooler (port `6543`) for migrations and the CMS.
   For `gcspqnjoyaokhirkgrfh`, the working host is
   `aws-0-ap-southeast-1.pooler.supabase.com` with user
   `postgres.gcspqnjoyaokhirkgrfh`. The direct `db.<ref>.supabase.co` host is
   IPv6-only on some networks; the session pooler is IPv4 and is what this
   project uses.

The anon/publishable key is safe to ship to a server, but it should still be
handled as a server-only value on Vercel. The service-role key bypasses
row-level security and must never be exposed to a browser or committed.

### Apply the waitlist migrations

Run these files in order in the Supabase **SQL Editor**. They are idempotent,
so re-running them is safe.

1. `supabase/migrations/20260930182335_create_waitlist_submissions.sql`
2. `supabase/migrations/20261022140000_waitlist_profile_fields.sql`
3. `supabase/migrations/20261023120000_waitlist_referrals_and_positions.sql`

The last migration adds:

- sequential `position`
- unique short `referral_code`
- optional `referred_by`
- case-insensitive email uniqueness
- the atomic, `SECURITY DEFINER` `waitlist_join(...)` RPC
- public execute grants for the RPC only

Verify:

```sql
select count(*) from public.waitlist_submissions;
select proname, prosecdef
from pg_proc
where proname in ('waitlist_join', 'waitlist_count');
```

Do not add an anon `select` policy on `waitlist_submissions`. The public counter
and the signup path are RPCs; rows should never be readable with the anon key.

---

## 4. Deploy the marketing site

Create a Vercel project from the repository. Use the repository root and the
default Next.js build. Set these environment variables for Production:

| Variable | Example | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://shelf.example.com` | Canonical origin; also used in referral links |
| `SUPABASE_URL` | `https://<ref>.supabase.co` | Server-only |
| `SUPABASE_ANON_KEY` | `<anon or publishable key>` | Server-only; preferred key for the waitlist RPC |
| `SUPABASE_PUBLISHABLE_KEY` | `<publishable key>` | Alternative name for the same value |
| `PAYLOAD_URL` | `https://cms.shelf.example.com` | Add after the CMS is deployed |
| `PAYLOAD_REVALIDATE_SECONDS` | `60` | Blog ISR fallback window |
| `REVALIDATE_SECRET` | long random string | Must match the CMS |

Optional:

- `SUPABASE_SERVICE_ROLE_KEY` — only if a server-side task needs to bypass RLS.
  Do not add it unless there is a concrete reason; the waitlist works with the
  anon key through `waitlist_join`.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — only needed if a browser-side
  Supabase client is added later. The current site does not use them.

The API route deliberately prefers `SUPABASE_ANON_KEY` over the public
`NEXT_PUBLIC_*` value. This avoids the Next build-time inlining problem where a
stale public key is baked into the server bundle. Keep `SUPABASE_*` as Vercel
server environment variables.

Deploy, then verify:

```bash
curl https://shelf.example.com/api/waitlist
# {"count":N}   (not null)
```

A `null` count means the server cannot reach Supabase or has the wrong key;
check the Vercel function logs for `[waitlist]` errors.

---

## 5. Deploy the CMS

Create a second Vercel project from the same repository with **Root Directory =
`cms`**. Set the Vercel project's Node version to 22 or 24 (Payload requires
Node 20.18+).

Set these Production environment variables:

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.<ref>:<password>@...pooler.supabase.com:5432/postgres` | Session pooler/direct; URL-encode special characters |
| `PAYLOAD_SECRET` | `openssl rand -hex 32` | Required; keep secret |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://cms.shelf.example.com` | Public CMS origin |
| `SITE_URL` | `https://shelf.example.com` | Site origin for links and revalidation |
| `REVALIDATE_SECRET` | same as site | Shared secret |
| `PAYLOAD_SEED_EMAIL` | admin email | Optional, only for the first seed |
| `PAYLOAD_SEED_PASSWORD` | strong password | Optional; remove after seeding |
| S3 variables (below) | | Required on Vercel for media |

Do **not** set `PAYLOAD_DB_PUSH=true` on the production database. Migrations are
the source of truth.

### Apply Payload migrations

The initial Payload migration has already been applied to the current
`gcspqnjoyaokhirkgrfh` project. Run this on a fresh database or new environment.
From a machine with the production `DATABASE_URL` in `cms/.env`:

```bash
npm run cms:migrate
```

This creates the `payload` schema and its tables. It is safe to run against a
fresh database and should be run once per environment.

Optional starter content:

```bash
npm run cms:seed
```

The seed imports the starter articles and can create the first admin if the
seed email/password are set. It also uploads the generated cover art. Configure
the storage variables in the next section **before** running the production
seed; otherwise the cover files are written to your local `cms/media` folder and
will not be available to the Vercel deployment. Remove
`PAYLOAD_SEED_PASSWORD` from Vercel after the first login.

### Deploy and connect

1. Deploy the CMS.
2. Open `https://cms.example.com/admin` and sign in.
3. Put the CMS URL into the site's `PAYLOAD_URL` and redeploy the site.
4. Put the site URL into the CMS's `SITE_URL` and redeploy the CMS if it changed.
5. Confirm both projects use the same `REVALIDATE_SECRET`.

The site falls back to its bundled articles if the CMS is unreachable. A
reachable but empty CMS shows an empty blog; publish the seeded posts or new
posts to fill it.

---

## 6. Media storage (required on Vercel)

Vercel's filesystem is ephemeral, so the CMS must use Supabase Storage in
production.

1. Supabase -> **Storage** -> create a **public** bucket, for example
   `shelf-media`.
2. Supabase -> **Project Settings -> Storage -> S3 access keys** -> create a
   key pair.
3. Add these to the CMS Vercel project:

```env
S3_BUCKET=shelf-media
S3_ENDPOINT=https://<ref>.supabase.co/storage/v1/s3
S3_REGION=<region shown in the Supabase dashboard>
S3_ACCESS_KEY_ID=<key id>
S3_SECRET_ACCESS_KEY=<secret>
SUPABASE_PUBLIC_MEDIA_URL=https://<ref>.supabase.co/storage/v1/object/public/shelf-media
```

Redeploy the CMS, upload an image in a post, and open the generated URL in a
private window. If the image 404s, check the bucket is public and the public
media URL is correct.

These S3 keys are not the Supabase anon/service-role keys. Treat them as
secrets.

---

## 7. Production verification checklist

### Waitlist

- [ ] `GET /api/waitlist` returns a numeric count
- [ ] A fresh signup returns a position and referral code
- [ ] The success card opens and focus moves into it
- [ ] `localStorage['shelf-waitlist-v1']` is saved
- [ ] Reloading the site shows the saved "joined" state
- [ ] Submitting the same email again returns the same position and does not
      create a second row
- [ ] Opening `/?ref=CODE`, then signing up, stores `referred_by=CODE`
- [ ] The referral URL works and the "View my spot" action reopens the card
- [ ] No anon key can read `waitlist_submissions` directly

### CMS and site content

- [ ] Admin login works with a non-seed account
- [ ] A new post can be saved as a draft
- [ ] Publishing the post makes it appear on the site within the ISR window
      (or immediately after the revalidation hook)
- [ ] Categories, cover image, alt text, and SEO fields render
- [ ] An uploaded image is served from Supabase Storage
- [ ] With `PAYLOAD_URL` temporarily unset, the site still renders the fallback
      blog instead of crashing

### Security and operations

- [ ] All secrets are in Vercel/Supabase, not in git
- [ ] `.env*` is ignored, with only `.env.example` committed
- [ ] `payload` schema is not exposed by the Supabase API
- [ ] Waitlist RLS has no anon select/update/delete policy
- [ ] `PAYLOAD_DB_PUSH` is unset in production
- [ ] Supabase database backups are enabled and the schedule is understood
- [ ] Storage backup/export is planned separately (database backups do not
      include storage objects)
- [ ] At least two CMS admins exist
- [ ] The old Supabase keys and any seed password are revoked

---

## 8. Operations notes

- **Migrations:** waitlist SQL lives in `supabase/migrations`; Payload
  migrations live in `cms/src/migrations`. Keep both in git and apply them in
  order. Never edit a production database by hand without recording the change
  as a migration.
- **Blog cache:** the site fetches blog content with ISR. Publishing calls
  `/api/revalidate`; if the site is briefly offline, the next ISR window picks
  up the change.
- **Rate limiting:** the waitlist route applies a best-effort in-memory limit
  (6 requests / 10 minutes / IP). Vercel may run several instances, so this is
  not a hard security boundary. The database unique index prevents duplicate
  emails. For serious abuse protection, put the API behind Vercel WAF/Upstash
  or add a Supabase-side rate limit.
- **No email delivery:** the waitlist stores signups; it does not send
  confirmation or referral emails. Add an email provider later if that is a
  product requirement.
- **Waitlist privacy:** do not expose the table or export CSVs publicly.
  Prefer a server-side admin/export process with the service-role key.
- **CMS preview deployments:** a preview CMS pointed at the production database
  can write to production. For now, keep the CMS production deployment as the
  only environment that receives editor traffic. If previews are needed, give
  them a separate staging Supabase project and separate secrets.
- **Key rotation:** rotate `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, the database
  password, and the S3 keys on a schedule or immediately after any suspected
  exposure.

---

## 9. Handoff sign-off

| Item | Owner | Done |
|---|---|---|
| Supabase project created and migrations applied | | |
| Waitlist API returns a count and accepts a signup | | |
| Site deployed with production env | | |
| CMS deployed and migrated | | |
| CMS URL connected to the site; revalidation tested | | |
| Storage bucket and S3 credentials configured | | |
| Two CMS admins created; seed password removed | | |
| DNS/TLS for site and CMS | | |
| Backups and key ownership confirmed | | |
| Team walkthrough completed | | |

For day-to-day local development, see `README.md`. The site's local fallback
blog, the CMS, and the local Supabase proxy are described there.
