export type Color = 'blue' | 'red' | 'yellow';
export type Brick = { id: number; color: Color; x: number; row: number; w: number };

export const COLS = 14;
export const ROWS = 8;
export const SEED = 7;

const COLORS: Color[] = ['blue', 'red', 'yellow'];

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Return the occupied height of each column. */
function heights(bricks: Brick[], cols = COLS) {
  const top = new Array(cols).fill(0) as number[];
  for (const brick of bricks) {
    for (let column = brick.x; column < brick.x + brick.w; column += 1) {
      top[column] = Math.max(top[column], brick.row + 1);
    }
  }
  return top;
}

/** Drop a brick to the first row supported by another brick or the floor. */
export function landingRow(bricks: Brick[], x: number, width: number, skipId?: number, cols = COLS) {
  const top = heights(bricks.filter((brick) => brick.id !== skipId), cols);
  let row = 0;
  for (let column = x; column < x + width; column += 1) row = Math.max(row, top[column]);
  return row;
}

/** Apply simple gravity while keeping brick order stable from floor upward. */
export function settle(bricks: Brick[], cols = COLS): Brick[] {
  const top = new Array(cols).fill(0) as number[];
  return [...bricks].sort((a, b) => a.row - b.row || a.x - b.x).map((brick) => {
    let row = 0;
    for (let column = brick.x; column < brick.x + brick.w; column += 1) row = Math.max(row, top[column]);
    for (let column = brick.x; column < brick.x + brick.w; column += 1) top[column] = row + 1;
    return { ...brick, row };
  });
}

/** Snap a brick to any open horizontal and vertical board position. */
export function moveBrick(bricks: Brick[], id: number, nextX: number, nextRow: number, cols = COLS, rows = ROWS): Brick[] {
  const moving = bricks.find((brick) => brick.id === id);
  if (!moving) return bricks;
  const x = Math.max(0, Math.min(cols - moving.w, Math.round(nextX)));
  const row = Math.max(0, Math.min(rows - 1, Math.round(nextRow)));
  const overlaps = bricks.some((brick) => brick.id !== id &&
    x < brick.x + brick.w && x + moving.w > brick.x &&
    row === brick.row);
  if (overlaps) return bricks;
  return bricks.map((brick) => brick.id === id ? { ...brick, x, row } : brick);
}

/** Clear a row only when every brick in it forms one contiguous, single-color run. */
export function findClears(bricks: Brick[]): Set<number> {
  const dead = new Set<number>();
  const byRow = new Map<number, Brick[]>();
  for (const brick of bricks) byRow.set(brick.row, [...(byRow.get(brick.row) ?? []), brick]);
  for (const row of Array.from(byRow.values())) {
    const ordered = [...row].sort((a, b) => a.x - b.x);
    if (ordered.length < 2) continue;
    const color = ordered[0].color;
    const contiguous = ordered.every((brick, index) =>
      brick.color === color && (index === 0 || ordered[index - 1].x + ordered[index - 1].w === brick.x),
    );
    if (contiguous) ordered.forEach((brick) => dead.add(brick.id));
  }
  return dead;
}

/** Bricks with no brick directly above any of their studs. */
export function exposedIds(bricks: Brick[]): Set<number> {
  const occupied = new Set<number>();
  for (const brick of bricks) for (let column = brick.x; column < brick.x + brick.w; column += 1) occupied.add(brick.row * COLS + column);
  const exposed = new Set<number>();
  for (const brick of bricks) {
    let free = true;
    for (let column = brick.x; column < brick.x + brick.w; column += 1) if (occupied.has((brick.row + 1) * COLS + column)) free = false;
    if (free) exposed.add(brick.id);
  }
  return exposed;
}

/** Deterministic board: six supported rows with varied seams and colors. */
export function generate(seed = SEED): Brick[] {
  const random = mulberry32(seed);
  const bricks: Brick[] = [];
  const top = new Array(COLS).fill(0) as number[];
  const density = [1, 1, 0.8, 0.5, 0.3, 0.15];
  let id = 0;
  for (let row = 0; row < density.length; row += 1) {
    let x = 0;
    let previous: Brick | null = null;
    while (x < COLS) {
      const width = Math.min(1 + Math.floor(random() * 5), COLS - x);
      let base = 0;
      for (let column = x; column < x + width; column += 1) base = Math.max(base, top[column]);
      if (base === row && random() < density[row]) {
        const avoid = previous && previous.x + previous.w === x ? previous.color : null;
        const options = COLORS.filter((color) => color !== avoid);
        const color = options[Math.floor(random() * options.length)];
        const brick: Brick = { id: id++, color, x, row, w: width };
        bricks.push(brick);
        for (let column = x; column < x + width; column += 1) top[column] = row + 1;
        previous = brick;
        x += width;
      } else x += 1;
    }
  }
  return bricks;
}

/** Remove cleared runs, apply gravity, and resolve any newly formed clears. */
export function clearAndSettle(bricks: Brick[], cols = COLS): Brick[] {
  let remaining = bricks;
  let clears = findClears(remaining);
  while (clears.size) {
    remaining = settle(remaining.filter((brick) => !clears.has(brick.id)), cols);
    clears = findClears(remaining);
  }
  return settle(remaining, cols);
}
