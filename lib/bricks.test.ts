import assert from 'node:assert/strict';
import test from 'node:test';
import { Brick, exposedIds, findClears, generate, moveBrick, settle } from './bricks';

test('the seeded wall is deterministic and contains supported, in-bounds bricks', () => {
  const first = generate();
  assert.deepEqual(generate(), first);
  assert.ok(first.every((brick) => brick.x >= 0 && brick.x + brick.w <= 40 && brick.row >= 0));
  assert.ok(first.every((brick) => brick.row === 0 || first.some((below) => below.row + 1 === brick.row && below.x < brick.x + brick.w && below.x + below.w > brick.x)));
  assert.ok(exposedIds(first).size > 0);
});

test('a horizontal move is blocked when it would overlap a neighbor', () => {
  const bricks: Brick[] = [
    { id: 1, color: 'blue', x: 0, row: 0, w: 3 },
    { id: 2, color: 'red', x: 3, row: 0, w: 2 },
  ];
  assert.deepEqual(moveBrick(bricks, 1, 1), bricks);
  assert.equal(moveBrick(bricks, 1, 10)[0].x, 10);
});

test('an eight-stud contiguous same-color run clears', () => {
  const bricks: Brick[] = [
    { id: 1, color: 'yellow', x: 0, row: 0, w: 3 },
    { id: 2, color: 'yellow', x: 3, row: 0, w: 2 },
    { id: 3, color: 'yellow', x: 5, row: 0, w: 3 },
    { id: 4, color: 'red', x: 8, row: 0, w: 2 },
  ];
  assert.deepEqual(Array.from(findClears(bricks)), [1, 2, 3]);
});

test('gravity drops unsupported bricks to the floor and stacks them', () => {
  const bricks: Brick[] = [
    { id: 1, color: 'blue', x: 4, row: 5, w: 2 },
    { id: 2, color: 'red', x: 4, row: 8, w: 2 },
  ];
  assert.deepEqual(settle(bricks).map(({ id, row }) => [id, row]), [[1, 0], [2, 1]]);
});
