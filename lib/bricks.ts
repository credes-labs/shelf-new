export type BrickColor = 'blue' | 'red' | 'yellow';
export type Brick = { id: number; color: BrickColor; x: number; row: number; width: number };
export const brickColors: BrickColor[] = ['blue', 'red', 'yellow'];

function random(seed: number) {
  let value = seed | 0;
  return () => { value = (value + 0x6d2b79f5) | 0; let t = Math.imul(value ^ (value >>> 15), 1 | value); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function createBricks(cols: number, seed = 23): Brick[] {
  const rnd = random(seed + cols * 17);
  const bricks: Brick[] = [];
  let id = 1;
  // Use one shared width inventory so every full row stays a continuous wall
  // and every piece has a valid same-width swap partner in the other rows.
  const widths: number[] = [];
  for (let remaining = cols; remaining > 0;) {
    const width = Math.min(1 + Math.floor(rnd() * 5), remaining);
    widths.push(width);
    remaining -= width;
  }
  for (let row = 0; row < 5; row++) {
    const rowWidths = [...widths];
    for (let i = rowWidths.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [rowWidths[i], rowWidths[j]] = [rowWidths[j], rowWidths[i]];
    }
    const color = brickColors[row % brickColors.length];
    let x = 0;
    for (const width of rowWidths) {
      bricks.push({ id: id++, color, x, row, width });
      x += width;
    }
  }

  const swapPositions = (a: Brick, b: Brick) => {
    const ax = a.x; const ar = a.row;
    a.x = b.x; a.row = b.row;
    b.x = ax; b.row = ar;
  };
  for (let count = 0; count < 5; count++) {
    const candidates = bricks.filter(a => a.row < 5 && bricks.some(b => b.row < 5 && b.row !== a.row && b.width === a.width && b.color !== a.color));
    if (!candidates.length) break;
    const a = candidates[Math.floor(rnd() * candidates.length)];
    const matches = bricks.filter(b => b.row < 5 && b.row !== a.row && b.width === a.width && b.color !== a.color);
    if (matches.length) swapPositions(a, matches[Math.floor(rnd() * matches.length)]);
  }

  // Loose upper bricks, supported by at least one brick below.
  for (let row = 5; row < 7; row++) {
    for (let x = 0; x < cols;) {
      const width = Math.min(1 + Math.floor(rnd() * 4), cols - x);
      const support = bricks.some(b => b.row === row - 1 && b.x < x + width && x < b.x + b.width);
      if (support && rnd() < (row === 5 ? .36 : .2)) bricks.push({ id: id++, color: brickColors[Math.floor(rnd() * 3)], x, row, width });
      x += width;
    }
  }
  return bricks;
}

const overlaps = (a: Brick, b: Brick) => a.x < b.x + b.width && b.x < a.x + a.width;
function settleAndClear(bricks: Brick[], cols: number): Brick[] {
  let current = bricks;
  while (true) {
    const top = Array(cols).fill(0) as number[];
    const settled = [...current].sort((a, b) => a.row - b.row || a.x - b.x).map(brick => {
      let row = 0;
      for (let c = brick.x; c < brick.x + brick.width; c++) row = Math.max(row, top[c]);
      for (let c = brick.x; c < brick.x + brick.width; c++) top[c] = row + 1;
      return { ...brick, row };
    });
    const byRow = new Map<number, Brick[]>();
    settled.forEach(brick => byRow.set(brick.row, [...(byRow.get(brick.row) ?? []), brick]));
    const cleared = new Set<number>();
    byRow.forEach(row => {
      const ordered = [...row].sort((a, b) => a.x - b.x);
      let edge = 0;
      const coversWall = ordered.every(brick => {
        if (brick.x !== edge) return false;
        edge += brick.width;
        return true;
      }) && edge === cols;
      if (coversWall && ordered.every(brick => brick.color === ordered[0].color)) {
        row.forEach(brick => cleared.add(brick.id));
      }
    });
    if (!cleared.size) return settled;
    current = settled.filter(brick => !cleared.has(brick.id));
  }
}

export function moveBrick(bricks: Brick[], id: number, x: number, cols: number, targetRow?: number): Brick[] {
  const held = bricks.find(b => b.id === id);
  if (!held) return bricks;
  x = Math.max(0, Math.min(cols - held.width, x));
  const others = bricks.filter(b => b.id !== id);
  const row = targetRow === undefined ? held.row : Math.max(0, Math.min(8, targetRow));
  const rowBlock = others.filter(b => b.row === row && overlaps({ ...held, x }, b));
  if (rowBlock.length) {
    if (rowBlock.length !== 1 || rowBlock[0].width !== held.width) return bricks;
    const target = rowBlock[0];
    const swapped = bricks.map(b => b.id === held.id ? { ...b, x: target.x, row: target.row } : b.id === target.id ? { ...b, x: held.x, row: held.row } : b);
    return settleAndClear(swapped, cols);
  }
  return settleAndClear(others.concat({ ...held, x, row }), cols);
}
