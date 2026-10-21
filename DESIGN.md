# Shelf 404 design

## Brief

Add a custom Next.js App Router not-found page to Shelf. Match the supplied
Shelf reference and the existing site: cobalt field, a 62/38 desktop split, the
archival map panel, white grotesk typography, and the supplied photographic
sticker SVGs. Keep every existing page untouched. No new fonts, no runtime
packages, no invented facts, no placeholder imagery. The page must fit one
screen with no scrolling.

## Concepts considered

Scores: originality / fit / feasibility / portability (lower portability is better).

| Territory | Concept | Signature and screenshot | Emotion | Anchor | Scores |
| --- | --- | --- | --- | --- | --- |
| Brand name | A page has slipped off its shelf, but the little things remain. | Huge 404 with a loose, selected zero and stickers that remember their own context. | A friendly wrong turn | Shelf keeps saved objects and context | 4/5/5/2 |
| Archival material | An unfiled page gets a lost-property tag on the blueprint. | A punched paper tag stamped Not found. | Curious, tactile | Existing blueprint collage and paper stickers | 4/5/5/3 |
| Navigation metaphor | A missing destination on a familiar map. | A wandering route line returns to a home marker. | Reassuring | Existing map visual | 3/4/4/4 |

The first concept was built first, then replaced at the owner's direction:
the 404 numerals, the description paragraph and the lost-property tag came out,
and a pixel maze took the centre of the page. The second concept survives only
as the line of voice. The third was dropped: a map search interface would
pretend to locate a page that does not exist.

## Concept card

Idea: The page you wanted is behind a maze, and a tiny invader is still
trapped in there with it.
Metaphor: A pixel-art maze rendered in the brand's violet and periwinkle.
Signature: A light pixel walks the dotted trail from the entrance to the
trapped invader, loops, and walks again.
Emotion: Shelved, quiet, a little playful. Never an error dialog.
Motion verb: One clock, small steps, pixel by pixel.
Screenshot: Cobalt field, a chunky periwinkle maze, a glowing violet invader
half way through it, photographic stickers on the corners, one line of type
underneath.

## System

- Ground: existing cobalt `#303bc7` (`--blue`).
- Ink on cobalt: `#ffffff`. Muted on cobalt: `#dfe2ff`.
- Maze palette: deep indigo `#171343` (floor and panel), periwinkle
  `#93a5fb` (walls and frame), saturated violet `#7c3aed` (the invader and
  loose fragments), pale lavender `#e0e7ff` (trail, cursor, eyes).
- Typography: existing Space Grotesk everywhere, no italic accent, one
  heading, one line of body, one small UI line. Display size is fluid, tracking
  is negative, body is 12 to 14 px only for UI.
- Grid: desktop keeps the site's 62/38 split with the archival map on the
  right; the content stack is centred in the cobalt panel. On mobile the map
  panel is dropped, matching the other content pages, so nothing scrolls.
- Shape: one radius rule (the pill action). The maze is square geometry with
  stepped edges and a 5 unit frame.
- Motion: GSAP only, scoped and reverted. Sticker entrance lifts and settles,
  the cursor walks the trail. Under reduced motion there is no cursor, no
  entrance and no sticker movement, and every word stays visible.
- Every action has hover, focus-visible and active states. Stickers are real
  buttons with a polite live region that announces their saved context.
- Native 404 routing, noindex metadata, no fake /404 route.

## Sound control

The site ships a synthesised interface sound (no audio files). It is now
optional and remembered between visits:

- `lib/ui-sound.ts` is the only place that creates an `AudioContext`, so the
  mute is absolute: `playUiSound` returns early, queued cues are dropped, and
  the shared context is suspended. Turning sound back on resumes it and plays
  one confirmation blip.
- The choice is stored in `localStorage` under `shelf-sound` and read once per
  session on the client, so the server always renders the default and the page
  never hydrates mismatched.
- Desktop: a 24 px speaker button at the bottom of the cobalt pane, immediately
  left of the hero dots.
- Mobile: the same 24 px button next to the staggered menu button, so it is
  reachable without opening the menu.
- Only one control is ever visible: the corner button is `display: none` below
  900 px and the header button is inside the desktop-hidden menu wrapper.

## Composition

Desktop:

```
| Shelf                       nav | archival map                  |
|                                  |                               |
|         [ pixel maze ]            |                               |
|      + the little things are      |                               |
|        still here. Try a sticker. |                               |
|                                  |                               |
|     This page slipped             |                               |
|     off the shelf.                |                               |
|     [ Back to home ]  Read the    |                               |
|                          blog ->  |                               |
| A wrong turn, not a dead end.     |                               |
```

Mobile: header, maze, context line, heading, actions, colophon. No map panel.

Genericness check: no centred error text, no vector astronaut, no decorative
coordinates. The maze, the invader and the real sticker art tie the page to
this specific site.

## QA scope

Production build, unknown top-level and nested URLs, desktop 1440, mobile 390
and 320, tablet 768, wide 1920, keyboard order, reduced motion, sticker
activation, return-home navigation, and an unchanged homepage. Temporary QA
dependencies and outputs live outside the repository.
