# Shelf — <img width="780" height="784" alt="image" src="https://github.com/user-attachments/assets/51eae049-6905-487b-a0d5-b8e35062cf77" />


<img width="3838" height="2156" alt="image" src="https://github.com/user-attachments/assets/595a8ec0-b8e6-4068-9374-314f59e24f74" />


## Quick start

```bash
git clone https://github.com/elyashium/shelf.git
cd shelf
npm install
```

```bash
# .env.local — required (see Environment below)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server only; falls back to anon key
```

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint
npm run build
```

## Features

- **Scroll hero** (`app/page.tsx`) — desktop shows a pinned 300vh scene that
  crossfades iPhone screens, headlines and sticker sets; mobile shows story
  panels (one per screen) with the same content.
- **Interactive stickers** — hover/tap any sticker for a chat bubble; on desktop
  they also parallax with the cursor, on mobile they vibrate while scrolling.
- **Waitlist** (`WaitlistSignup` + `/api/waitlist`) — modal form, success card
  with download/share, live join counter with a shared 60s cache.
- **Brick footer** (`BrickFooter`, mobile only) — a draggable brick wall game
  over a half-cut logo watermark. Never renders on desktop.
- **UI sounds** (`lib/ui-sound.ts`) — scroll ticks and interaction sounds with
  reduced-motion support.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 13.5 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3, CSS modules for footer/modal, `components.json` (shadcn-style) |
| Data | Supabase (`@supabase/supabase-js`, REST via route handler) |
| Hosting | Vercel (GitHub-connected) |

## Project structure

```
app/
  layout.tsx              Root layout: fonts, UiSoundManager, globals.css
  page.tsx                Homepage hero (desktop .hero-stage + mobile .mobile-story)
  globals.css             Global styles: hero, mobile story, waitlist, footer
  api/waitlist/route.ts   POST signups -> Supabase · GET join count
  about/ blog/ contact/ features/ security/ terms/   Content pages
components/
  SiteHeader.tsx / StaggeredMenu.tsx     Nav + mobile menu
  WaitlistSignup.tsx      Join button + modal form + success card
  WaitlistProof.tsx       Avatar stack + live counter (hideLabel/hideFaces props)
  ModalPeels.tsx / StickerPeel.tsx / StickerScatter.tsx  Popup sticker effects
  DataTypeIcons.tsx / HeadlineStyleToken.tsx             Hero artwork pieces
  BrickFooter.tsx (+ .module.css)  Mobile brick-puzzle footer
  SocialIcons.tsx / FooterLinks.tsx / ContentPage.tsx
lib/
  bricks.ts               Wall generation, clear detection, settle physics
  useBrickDrag.ts         Pointer-drag interaction for the footer game
  ui-sound.ts             Sound engine (ticks, taps, success)
  utils.ts                cn() classnames helper
hooks/
  use-toast.ts            Toast hook
public/
  svg/                    Phone screens, stickers, logos, waitlist card art
  images/waitlist/        Illustrative member portraits
supabase/
  migrations/20260930182335_create_waitlist_submissions.sql
```

## Environment

| Variable | Where | Used by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Supabase client init |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Supabase client init |
| `SUPABASE_URL` | Server only | `/api/waitlist` route |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | `/api/waitlist` route (falls back to anon key) |

Never commit secrets — `.env*` is gitignored. Only `NEXT_PUBLIC_*` vars are
visible in the browser; keep the service-role key server-side.

## Database

Apply the migration so `waitlist_submissions` exists:

```bash
supabase link --project-ref <ref>
supabase db push
```

or run `supabase/migrations/20260930182335_create_waitlist_submissions.sql`
in the Supabase dashboard SQL editor.

## Deploy (Vercel)

1. Import `elyashium/shelf` in Vercel (Next.js preset — `npm run build`).
2. Add the four environment variables above (production + preview).
3. Deploy. Every push to the default branch redeploys automatically.

## Conventions

- Mobile hero/footer CSS lives behind `@media (max-width: 900px)` in
  `app/globals.css`; desktop uses `@media (min-width: 901px)`. Keep the tracks
  independent — desktop ships no footer.
- Mobile story layout is budget-driven (`--story-*` vars in `.mobile-story-step`):
  the phone is sized from its art row so it can never grow into the headline;
  the copy reserve is shared so the phone keeps one size across panels.
- Never commit: `node_modules/`, `.next/`, `.env*`, agent workspaces
  (`.claude/`, `.next-codex-verify-*/`) — all in `.gitignore`.
