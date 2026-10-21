/**
 * A fixed, deterministic pixel maze for the 404 page.
 *
 * The maze is generated once at module scope with a fixed seed so the server
 * and the client render exactly the same artwork (no hydration mismatch) and
 * the illustration never changes between visits.
 *
 * Geometry: rooms are two lattice units wide, walls are one unit, so the
 * corridors read as corridors. One lattice unit is one blocky "pixel" of
 * artwork, and the whole illustration sits on a single pixel grid.
 */

type Dir = 'n' | 'e' | 's' | 'w';

const DIRS: { dx: number; dy: number; wall: Dir; opp: Dir }[] = [
  { dx: 0, dy: -1, wall: 'n', opp: 's' },
  { dx: 1, dy: 0, wall: 'e', opp: 'w' },
  { dx: 0, dy: 1, wall: 's', opp: 'n' },
  { dx: -1, dy: 0, wall: 'w', opp: 'e' },
];

const COLS = 7;
const ROWS = 5;
const UNIT = 24;
const PAD = 24;
const SEED = 20261021;

/** Classic 8x8 space invader. */
const INVADER = [
  '..#..#..',
  '...##...',
  '..####..',
  '.##.##.#',
  '#######.',
  '#.###.#.',
  '#.#...#.',
  '..#..#..',
];

export const MAZE_WIDTH = (COLS * 3 + 1) * UNIT + PAD * 2;
export const MAZE_HEIGHT = (ROWS * 3 + 1) * UNIT + PAD * 2;

export type Rect = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };

export type PixelMazeData = {
  width: number;
  height: number;
  /** Wall blocks, merged into horizontal runs. */
  walls: Rect[];
  /** Loose pixels scattered on the floor. */
  fragments: { x: number; y: number; size: number; tone: 'violet' | 'periwinkle' }[];
  /** The dotted trail that leads from the entrance to the invader. */
  trail: Point[];
  /** Blocky invader, already merged into runs. */
  invader: { x: number; y: number; block: number; pixels: Rect[]; eyes: Rect[] };
  /** Where the trail enters the maze. */
  entrance: Point;
};

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMaze(rand: () => number) {
  const cells = Array.from({ length: COLS * ROWS }, () => ({ n: true, e: true, s: true, w: true }));
  const at = (x: number, y: number) => cells[y * COLS + x];
  const seen = new Array(COLS * ROWS).fill(false);
  const stack: [number, number][] = [[0, 0]];
  seen[0] = true;

  while (stack.length) {
    const top = stack[stack.length - 1];
    const x = top[0];
    const y = top[1];

    const options: typeof DIRS = [];
    for (const d of DIRS) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      if (seen[ny * COLS + nx]) continue;
      options.push(d);
    }

    if (options.length === 0) {
      stack.pop();
      continue;
    }

    const d = options[Math.floor(rand() * options.length)];
    const nx = x + d.dx;
    const ny = y + d.dy;
    at(x, y)[d.wall] = false;
    at(nx, ny)[d.opp] = false;
    seen[ny * COLS + nx] = true;
    stack.push([nx, ny]);
  }

  return cells;
}

/** Rasterise the cell maze onto the pixel lattice: two open units per room, one per wall. */
function toLattice(cells: ReturnType<typeof buildMaze>, entranceCell: number) {
  const gw = COLS * 3 + 1;
  const gh = ROWS * 3 + 1;
  const grid: string[][] = Array.from({ length: gh }, () => new Array<string>(gw).fill('#'));

  const open = (x: number, y: number) => {
    grid[y][x] = '.';
  };

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = cells[y * COLS + x];
      // Room: two by two units.
      open(x * 3 + 1, y * 3 + 1);
      open(x * 3 + 2, y * 3 + 1);
      open(x * 3 + 1, y * 3 + 2);
      open(x * 3 + 2, y * 3 + 2);
      // Open walls: the single unit between two rooms.
      if (!c.n) { open(x * 3 + 1, y * 3); open(x * 3 + 2, y * 3); }
      if (!c.s) { open(x * 3 + 1, y * 3 + 3); open(x * 3 + 2, y * 3 + 3); }
      if (!c.w) { open(x * 3, y * 3 + 1); open(x * 3, y * 3 + 2); }
      if (!c.e) { open(x * 3 + 3, y * 3 + 1); open(x * 3 + 3, y * 3 + 2); }
    }
  }

  // The way in: a gap in the top wall above the entrance room.
  const ex = entranceCell % COLS;
  open(ex * 3 + 1, 0);
  open(ex * 3 + 2, 0);

  return { grid, gw, gh };
}

/** Shortest route between two rooms (the maze is a perfect maze, so the route is unique). */
function route(cells: ReturnType<typeof buildMaze>, from: number, to: number) {
  const prev = new Int32Array(COLS * ROWS).fill(-1);
  const seen = new Uint8Array(COLS * ROWS);
  const queue = [from];
  seen[from] = 1;

  while (queue.length) {
    const current = queue.shift() as number;
    if (current === to) break;
    const x = current % COLS;
    const y = Math.floor(current / COLS);

    for (const d of DIRS) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      const index = ny * COLS + nx;
      if (seen[index]) continue;
      if (cells[current][d.wall]) continue;
      seen[index] = 1;
      prev[index] = current;
      queue.push(index);
    }
  }

  const path: number[] = [];
  let cursor = to;
  while (cursor !== -1) {
    path.unshift(cursor);
    if (cursor === from) break;
    cursor = prev[cursor];
  }
  return path;
}

function roomCenter(index: number): Point {
  const x = index % COLS;
  const y = Math.floor(index / COLS);
  return { x: (x * 3 + 1.5) * UNIT + PAD, y: (y * 3 + 1.5) * UNIT + PAD };
}

function build(): PixelMazeData {
  const rand = mulberry32(SEED);
  const cells = buildMaze(rand);

  const openSides = (index: number) => {
    const c = cells[index];
    let open = 0;
    if (!c.n) open++;
    if (!c.e) open++;
    if (!c.s) open++;
    if (!c.w) open++;
    return open;
  };

  /** Distance in rooms from a starting room to every other room. */
  const distanceFrom = (start: number) => {
    const distance = new Int32Array(COLS * ROWS).fill(-1);
    const queue = [start];
    distance[start] = 0;
    while (queue.length) {
      const current = queue.shift() as number;
      const x = current % COLS;
      const y = Math.floor(current / COLS);
      for (const d of DIRS) {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
        const index = ny * COLS + nx;
        if (distance[index] !== -1) continue;
        if (cells[current][d.wall]) continue;
        distance[index] = distance[current] + 1;
        queue.push(index);
      }
    }
    return distance;
  };

  // The invader sits in the furthest dead end, away from the top edge, so it
  // is genuinely trapped and clear of the stickers that sit on the corners.
  const fromStart = distanceFrom(0);
  let trap = -1;
  let best = -1;
  for (let index = 0; index < COLS * ROWS; index++) {
    if (Math.floor(index / COLS) === 0) continue;
    if (openSides(index) !== 1) continue;
    if (fromStart[index] > best) {
      best = fromStart[index];
      trap = index;
    }
  }
  if (trap === -1) trap = COLS * ROWS - 1;

  // The way in is a room along the top edge, as far from the trap as possible.
  const fromTrap = distanceFrom(trap);
  let entrance = 0;
  let entranceBest = -1;
  for (let x = 0; x < COLS; x++) {
    const index = x;
    if (index === trap) continue;
    if (fromTrap[index] > entranceBest) {
      entranceBest = fromTrap[index];
      entrance = index;
    }
  }

  const { grid } = toLattice(cells, entrance);
  const path = route(cells, entrance, trap);
  const trail = path.map(roomCenter);
  // The last room belongs to the invader, so the trail stops at its doorstep.
  const trailDots = trail.length > 1 ? trail.slice(0, -1) : trail;

  // Wall blocks, merged into horizontal runs of the lattice.
  const walls: Rect[] = [];
  for (let y = 0; y < grid.length; y++) {
    let run = 0;
    for (let x = 0; x <= grid[y].length; x++) {
      if (x < grid[y].length && grid[y][x] === '#') {
        run++;
        continue;
      }
      if (run) {
        walls.push({ x: x - run, y, w: run, h: 1 });
        run = 0;
      }
    }
  }

  // Loose pixels on the floor, away from the trail.
  const onTrail = new Set(path);
  const fragments: PixelMazeData['fragments'] = [];
  const floor: number[] = [];
  for (let index = 0; index < COLS * ROWS; index++) {
    if (!onTrail.has(index)) floor.push(index);
  }
  for (let i = 0; i < 8 && floor.length; i++) {
    const pick = Math.floor(rand() * floor.length);
    const index = floor.splice(pick, 1)[0];
    const centre = roomCenter(index);
    const size = rand() > 0.5 ? 9 : 6;
    fragments.push({
      x: centre.x - 24 + 3,
      y: centre.y - 24 + 3 + Math.floor(rand() * 10),
      size,
      tone: rand() > 0.45 ? 'violet' : 'periwinkle',
    });
  }

  // Blocky invader, merged into runs of blocks. The 8x8 sprite sits inside its room.
  const block = (UNIT * 2 - 4) / INVADER.length;
  const pixels: Rect[] = [];
  const eyes: Rect[] = [];
  INVADER.forEach((row, y) => {
    let run = 0;
    const flush = (end: number) => {
      if (run) {
        pixels.push({ x: end - run, y, w: run, h: 1 });
        run = 0;
      }
    };
    for (let x = 0; x <= row.length; x++) {
      if (x < row.length && row[x] === '#') {
        run++;
        continue;
      }
      flush(x);
    }
  });
  // Eyes: the two gaps beside the invader's brow.
  eyes.push({ x: 2, y: 1, w: 1, h: 1 });
  eyes.push({ x: 5, y: 1, w: 1, h: 1 });

  const invaderOrigin = roomCenter(trap);
  const invaderSize = INVADER.length * block;

  return {
    width: MAZE_WIDTH,
    height: MAZE_HEIGHT,
    walls: walls.map(wall => ({ x: wall.x * UNIT + PAD, y: wall.y * UNIT + PAD, w: wall.w * UNIT, h: wall.h * UNIT })),
    fragments,
    trail: trailDots,
    invader: {
      x: invaderOrigin.x - invaderSize / 2,
      y: invaderOrigin.y - invaderSize / 2,
      block,
      pixels: pixels.map(pixel => ({ x: pixel.x * block, y: pixel.y * block, w: pixel.w * block, h: pixel.h * block })),
      eyes: eyes.map(eye => ({ x: eye.x * block, y: eye.y * block, w: eye.w * block, h: eye.h * block })),
    },
    entrance: trail[0],
  };
}

export const pixelMaze: PixelMazeData = build();
