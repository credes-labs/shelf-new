/**
 * Pure game logic. No React, no DOM.
 *
 * Coordinates: x = column of the left edge, row = 0 is the floor, w = width in studs.
 * Rules: drag any brick. Drop it on empty space (it falls onto the stack) or onto
 * one brick of the SAME width (the two swap). A row that is completely full and a
 * single color clears; everything above falls.
 */

export type Color = 'blue' | 'red' | 'yellow';
export type Motion = 'none' | 'fall' | 'glide';

export type Brick = {
  id: number;
  color: Color;
  x: number;
  row: number;
  w: number;
  /** Cells travelled by the last move. Drives animation duration and landing squash. */
  travel: number;
  motion: Motion;
};

export type Drop = {
  kind: 'place' | 'swap' | 'none';
  bricks: Brick[];
  x: number;
  row: number;
  swapId: number | null;
};

export const SEED = 7;
export const CLEAR_MS = 380;
export const STAGGER_MS = 30;

const COLORS: Color[] = ['blue', 'red', 'yellow'];

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Wall size for a container width. Cells end up roughly 46px (30px on phones). */
export function layoutFor(width: number) {
  const target = width < 640 ? 30 : 46;
  return {
    cols: Math.max(12, Math.round(width / target)),
    rows: width < 390 ? 6 : width < 620 ? 7 : 8,
  };
}

/** Longer trips take longer, but with diminishing returns (like falling under gravity). */
export const moveMs = (travel: number) => (travel > 0.01 ? Math.round(170 + Math.sqrt(travel) * 120) : 0);

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const overlapsX = (b: Brick, x: number, w: number) => b.x < x + w && x < b.x + b.w;

function columnHeights(bricks: Brick[], cols: number) {
  const top: number[] = new Array(cols).fill(0);
  for (const b of bricks) for (let c = b.x; c < b.x + b.w; c++) top[c] = Math.max(top[c], b.row + 1);
  return top;
}

function restRow(top: number[], x: number, w: number) {
  let r = 0;
  for (let c = x; c < x + w; c++) r = Math.max(r, top[c]);
  return r;
}

/**
 * Builds a puzzle that is always solvable: start from rows that are each a single
 * color, then scramble by swapping the colors of equal-width bricks in different rows
 * (the exact move the player has). Finally add a few loose bricks on top for room to play.
 */
export function generate(cols: number, rows: number, seed = SEED): Brick[] {
  const rnd = mulberry32(seed + cols * 101 + rows);
  const pick = <T>(list: T[]) => list[Math.floor(rnd() * list.length)];

  const puzzleRows = rows >= 8 ? 4 : 3;
  const extraRows = Math.max(0, Math.min(2, rows - puzzleRows - 2));
  const bricks: Brick[] = [];
  let id = 0;
  const make = (color: Color, x: number, row: number, w: number): Brick => ({
    id: id++, color, x, row, w, travel: 0, motion: 'none',
  });

  const palette = [...COLORS].sort(() => rnd() - 0.5);
  for (let r = 0; r < puzzleRows; r++) {
    for (let x = 0; x < cols; ) {
      const w = Math.min(1 + Math.floor(rnd() * 5), cols - x);
      bricks.push(make(palette[r % 3], x, r, w));
      x += w;
    }
  }

  const puzzle = bricks.slice();
  const swapColors = (a: Brick) => {
    const mates = puzzle.filter((b) => b.w === a.w && b.row !== a.row && b.color !== a.color);
    if (!mates.length) return;
    const b = pick(mates);
    [a.color, b.color] = [b.color, a.color];
  };
  for (let i = 0; i < cols * 3; i++) swapColors(pick(puzzle));

  const solved = (r: number) => {
    const row = puzzle.filter((b) => b.row === r);
    return row.every((b) => b.color === row[0].color);
  };
  for (let r = 0; r < puzzleRows; r++) {
    for (let guard = 0; guard < 60 && solved(r); guard++) swapColors(pick(puzzle.filter((b) => b.row === r)));
  }

  // loose bricks on top
  const top: number[] = new Array(cols).fill(puzzleRows);
  const density = [0.38, 0.22];
  for (let e = 0; e < extraRows; e++) {
    const r = puzzleRows + e;
    let prev: Brick | null = null;
    for (let x = 0; x < cols; ) {
      const w = Math.min(1 + Math.floor(rnd() * 4), cols - x);
      if (restRow(top, x, w) === r && rnd() < density[e]) {
        const avoid = prev && prev.x + prev.w === x ? prev.color : null;
        const b = make(pick(COLORS.filter((c) => c !== avoid)), x, r, w);
        bricks.push(b);
        for (let c = x; c < x + w; c++) top[c] = r + 1;
        prev = b;
        x += w;
      } else x += 1;
    }
  }
  return bricks;
}

/** Gravity: every brick falls until it rests on something. */
export function settle(bricks: Brick[], cols: number): Brick[] {
  const top: number[] = new Array(cols).fill(0);
  return [...bricks]
    .sort((a, b) => a.row - b.row || a.x - b.x)
    .map((b) => {
      const row = restRow(top, b.x, b.w);
      for (let c = b.x; c < b.x + b.w; c++) top[c] = row + 1;
      return { ...b, row };
    });
}

/** Copy `next`, recording how far each brick moved relative to `prev`. */
export function annotate(prev: Brick[], next: Brick[]): Brick[] {
  const before = new Map(prev.map((b) => [b.id, b]));
  return next.map((b) => {
    const o = before.get(b.id);
    const dx = o ? b.x - o.x : 0;
    const dy = o ? b.row - o.row : 0;
    const travel = Math.hypot(dx, dy);
    const motion: Motion = travel === 0 ? 'none' : dy < 0 ? 'fall' : 'glide';
    return { ...b, travel, motion };
  });
}

/** Rows that are completely full and all one color. */
export function findClears(bricks: Brick[], cols: number): Set<number> {
  const rows = new Map<number, Brick[]>();
  for (const b of bricks) rows.set(b.row, [...(rows.get(b.row) ?? []), b]);
  const dead = new Set<number>();
  for (const list of Array.from(rows.values())) {
    const full = list.reduce((s, b) => s + b.w, 0) === cols;
    if (full && list.every((b) => b.color === list[0].color)) list.forEach((b) => dead.add(b.id));
  }
  return dead;
}

/** Left-to-right index of each cleared brick inside its row (for the staggered pop). */
export function clearOrder(bricks: Brick[], ids: number[]): Map<number, number> {
  const dead = new Set(ids);
  const byRow = new Map<number, Brick[]>();
  for (const b of bricks) if (dead.has(b.id)) byRow.set(b.row, [...(byRow.get(b.row) ?? []), b]);
  const order = new Map<number, number>();
  for (const list of Array.from(byRow.values())) list.sort((a, b) => a.x - b.x).forEach((b, i) => order.set(b.id, i));
  return order;
}

/**
 * What happens if brick `id` is released with its top-left corner over cell (x, row)?
 *  - empty space with support (floor, or a brick directly underneath in every
 *    column) -> it stays exactly where aimed ("place"). This lets a brick tuck
 *    back into a gap below the stack top, e.g. the hole it was lifted from.
 *  - empty space without support -> it falls onto the stack ("place").
 *  - one brick of equal width -> they trade places ("swap")
 *  - anything else -> not allowed ("none"), the brick springs back
 */
export function resolveDrop(bricks: Brick[], id: number, x: number, row: number, cols: number, rows: number): Drop {
  const held = bricks.find((b) => b.id === id);
  const none: Drop = { kind: 'none', bricks, x, row, swapId: null };
  if (!held) return none;

  x = clamp(x, 0, cols - held.w);
  row = clamp(row, 0, rows - 1);
  const others = bricks.filter((b) => b.id !== id);
  const hit = others.filter((b) => b.row === row && overlapsX(b, x, held.w));

  if (hit.length === 0) {
    const supported =
      row === 0 ||
      Array.from({ length: held.w }, (_, i) => x + i).every((c) =>
        others.some((b) => b.row === row - 1 && b.x <= c && c < b.x + b.w),
      );
    const landing = supported ? row : restRow(columnHeights(others, cols), x, held.w);
    if (landing >= rows) return none;
    const placed = settle([...others, { ...held, x, row: landing }], cols);
    return { kind: 'place', bricks: placed, x, row: landing, swapId: null };
  }

  if (hit.length === 1 && hit[0].w === held.w) {
    const o = hit[0];
    const swapped = bricks.map((b) =>
      b.id === held.id ? { ...b, x: o.x, row: o.row } : b.id === o.id ? { ...b, x: held.x, row: held.row } : b,
    );
    return { kind: 'swap', bricks: swapped, x: o.x, row: o.row, swapId: o.id };
  }

  return none;
}
