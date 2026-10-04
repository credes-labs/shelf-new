# Shelf — Keep your context

A Next.js (App Router) marketing + waitlist site for Shelf. A scroll-driven hero
(desktop pinned scene / mobile story panels with an iPhone preview and sticker
artwork), content pages, a waitlist API backed by Supabase, and a playable
brick footer on mobile.

## Stack

- Next.js 13.5 (App Router), React 18, TypeScript
- Tailwind CSS 3 + shadcn-style `components.json` setup
- Supabase (`@supabase/supabase-js`) for waitlist storage
- Deployed on Netlify (`netlify.toml` + `@netlify/plugin-nextjs`)

## Repo structure

```
app/
  layout.tsx            Root layout (fonts, UiSoundManager, globals.css)
  page.tsx              Homepage: scroll hero (desktop .hero-stage + mobile .mobile-story)
  globals.css           Global styles incl. hero / mobile-story / footer CSS
  api/waitlist/route.ts POST waitlist signups -> Supabase; GET count
  about|blog|contact|features|security|terms/  Content pages
components/
  SiteHeader.tsx / StaggeredMenu.tsx   Nav + mobile menu
  WaitlistSignup.tsx    Join-waitlist button + modal form
  WaitlistProof.tsx     Avatar stack + join counter
  ModalPeels.tsx / StickerPeel.tsx / StickerScatter.tsx  Popup sticker effects
  DataTypeIcons.tsx / HeadlineStyleToken.tsx   Hero artwork bits
  BrickFooter.tsx (+ .module.css)  Mobile brick-puzzle footer
  SocialIcons.tsx / FooterLinks.tsx / ContentPage.tsx
lib/
  bricks.ts             Brick wall generation / clear / settle logic
  useBrickDrag.ts       Drag interaction for the footer game
  ui-sound.ts           Scroll-tick + UI sound engine
  utils.ts              cn() class helper
hooks/
  use-toast.ts          Toast hook (shadcn)
public/
  svg/                  Phone screens, stickers, logos, cards
  images/waitlist/      Illustrative member portraits
supabase/
  migrations/20260930182335_create_waitlist_submissions.sql
```

Key flows:

- `app/page.tsx` tracks hero scroll progress (desktop: pinned 300vh scene;
  mobile: story panels) to crossfade iPhone screens, headlines and sticker sets.
- `WaitlistSignup` opens the modal form, posts to `/api/waitlist`, and shows
  the waitlist card on success. `WaitlistProof` fetches the live count (shared,
  cached 60s across instances).
- `BrickFooter` renders only on mobile (`display: none` on desktop) with the
  brick wall game over a half-cut logo watermark.

## Recreation steps (fresh clone)

Prerequisites: Node 18+ (20 recommended), npm, a Supabase project, Supabase CLI
(optional, for migrations).

```bash
git clone https://github.com/elyashium/shelf.git
cd shelf
npm install
```

1. Database — apply the migration so the `waitlist_submissions` table exists:
   - Via CLI: `supabase link --project-ref <ref>`, then `supabase db push`, or
   - Via Dashboard: run `supabase/migrations/20260930182335_create_waitlist_submissions.sql`
     in the SQL editor.
2. Environment — create `.env.local` (never commit; `.env*` is gitignored):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
   The API route also accepts service-role configuration if you extend it —
   see `app/api/waitlist/route.ts`.
3. Run locally:
   ```bash
   npm run dev      # http://localhost:3000
   ```
4. Verify before pushing:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

## Deploy

Push to the default branch; Netlify builds with `npx next build` per
`netlify.toml`. Set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Netlify site environment.

## Conventions

- Mobile hero/footer work lives behind `@media (max-width: 900px)` in
  `app/globals.css`; desktop uses `@media (min-width: 901px)`. Keep the two
  tracks independent — desktop ships no footer.
- Never commit: `node_modules/`, `.next/`, `.env*`, agent workspaces
  (`.claude/`, `.next-codex-verify-*/`) — all covered in `.gitignore`.
