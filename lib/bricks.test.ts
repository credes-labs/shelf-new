import assert from 'node:assert/strict';
import test from 'node:test';
import { Brick, COLS, exposedIds, findClears, generate, moveBrick, settle } from './bricks';

test('the seeded wall is deterministic and contains supported, in-bounds bricks', () => {
  const first = generate();
  assert.deepEqual(generate(), first);
  assert.ok(first.every((brick) => brick.x >= 0 && brick.x + brick.w <= COLS && brick.row >= 0));
  assert.ok(first.every((brick) => brick.row === 0 || first.some((below) => below.row + 1 === brick.row && below.x < brick.x + brick.w && below.x + below.w > brick.x)));
  assert.ok(exposedIds(first).size > 0);
});

test('bricks move in both axes and stop before overlapping another brick', () => {
  const bricks: Brick[] = [
    { id: 1, color: 'blue', x: 0, row: 0, w: 3 },
    { id: 2, color: 'red', x: 3, row: 0, w: 2 },
  ];
  assert.deepEqual(moveBrick(bricks, 1, 1, 0), bricks);
  assert.equal(moveBrick(bricks, 1, 10, 0)[0].x, 10);
  assert.equal(moveBrick(bricks, 1, 0, 3)[0].row, 3);
});

test('only a complete contiguous row in one color clears', () => {
  const bricks: Brick[] = [
    { id: 1, color: 'yellow', x: 0, row: 0, w: 3 },
    { id: 2, color: 'yellow', x: 3, row: 0, w: 2 },
    { id: 3, color: 'yellow', x: 5, row: 0, w: 3 },
    { id: 4, color: 'red', x: 8, row: 0, w: 2 },
  ];
  assert.deepEqual(Array.from(findClears(bricks)), []);
  const completeRow = bricks.slice(0, 3);
  assert.deepEqual(Array.from(findClears(completeRow)), [1, 2, 3]);
  const rowWithGap = completeRow.map((brick) => ({ ...brick, x: brick.x + (brick.id === 3 ? 1 : 0) }));
  assert.deepEqual(Array.from(findClears(rowWithGap)), []);
});

test('gravity drops unsupported bricks to the floor and stacks them', () => {
  const bricks: Brick[] = [
    { id: 1, color: 'blue', x: 4, row: 5, w: 2 },
    { id: 2, color: 'red', x: 4, row: 8, w: 2 },
  ];
  assert.deepEqual(settle(bricks).map(({ id, row }) => [id, row]), [[1, 0], [2, 1]]);
});
