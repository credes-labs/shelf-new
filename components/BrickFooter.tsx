'use client';

import { PointerEvent, useEffect, useReducer, useRef } from 'react';
import Image from 'next/image';
import { Brick, clearAndSettle, exposedIds, findClears, generate, moveBrick, ROWS, SEED } from '@/lib/bricks';

type State = { bricks: Brick[]; draggingId: number | null; dyingIds: number[]; resetVersion: number };
type Action =
  | { type: 'start'; id: number }
  | { type: 'move'; id: number; x: number }
  | { type: 'drop'; id: number }
  | { type: 'settle' }
  | { type: 'reset' };

const initialState: State = { bricks: generate(SEED), draggingId: null, dyingIds: [], resetVersion: 0 };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start': return { ...state, draggingId: action.id };
    case 'move': return state.draggingId === action.id ? { ...state, bricks: moveBrick(state.bricks, action.id, action.x) } : state;
    case 'drop': {
      const clears = findClears(state.bricks);
      return clears.size
        ? { ...state, draggingId: null, dyingIds: Array.from(clears) }
        : { ...state, draggingId: null, bricks: clearAndSettle(state.bricks) };
    }
    case 'settle': return { ...state, bricks: clearAndSettle(state.bricks), dyingIds: [] };
    case 'reset': return { bricks: generate(SEED), draggingId: null, dyingIds: [], resetVersion: state.resetVersion + 1 };
  }
}

export default function BrickFooter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sectionRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; offset: number; lastX: number } | null>(null);
  const cellRef = useRef(44);
  const exposed = exposedIds(state.bricks);
  const dying = new Set(state.dyingIds);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const readCellSize = () => {
      cellRef.current = parseFloat(getComputedStyle(section).getPropertyValue('--u')) || 44;
    };
    readCellSize();
    const observer = new ResizeObserver(readCellSize);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!state.dyingIds.length) return;
    const timer = window.setTimeout(() => dispatch({ type: 'settle' }), 260);
    return () => window.clearTimeout(timer);
  }, [state.dyingIds]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const element = target.closest<HTMLElement>('[data-brick-id]');
    const id = Number(element?.dataset.brickId);
    if (!element || !Number.isFinite(id) || !exposed.has(id)) return;
    const unit = cellRef.current;
    const wall = wallRef.current;
    if (!wall) return;
    const wallRect = wall.getBoundingClientRect();
    const brickRect = element.getBoundingClientRect();
    const offset = (event.clientX - brickRect.left) / unit;
    const x = Math.round((brickRect.left - wallRect.left) / unit);
    dragRef.current = { id, offset, lastX: x };
    dispatch({ type: 'start', id });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = dragRef.current;
    const wall = wallRef.current;
    if (!current || !wall) return;
    const wallRect = wall.getBoundingClientRect();
    const x = Math.round((event.clientX - wallRect.left) / cellRef.current - current.offset);
    if (x === current.lastX) return;
    current.lastX = x;
    dispatch({ type: 'move', id: current.id, x });
  }

  function onPointerUp() {
    const current = dragRef.current;
    dragRef.current = null;
    if (current) dispatch({ type: 'drop', id: current.id });
  }

  return <section ref={sectionRef} className="brick-footer" aria-label="Sort the bricks">
    <Image className="brick-footer-art" src="/svg/shelf-footer.svg" alt="" aria-hidden="true" width={932} height={146} unoptimized />
    <div className="brick-footer-hint">
      <span>Drag · Same-color rows drop</span>
      <button type="button" onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
    <div
      ref={wallRef}
      className={`brick-wall${state.resetVersion ? ' brick-wall-has-reset' : ''}`}
      aria-hidden="true"
      style={{ ['--rows' as string]: ROWS, ['--reset-version' as string]: state.resetVersion }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {state.bricks.map((brick) => {
        const canMove = exposed.has(brick.id) && !state.dyingIds.length;
        const isDragging = state.draggingId === brick.id;
        const classNames = ['sorting-brick', `sorting-brick-${brick.color}`];
        if (canMove) classNames.push('sorting-brick-exposed');
        if (isDragging) classNames.push('sorting-brick-dragging');
        if (dying.has(brick.id)) classNames.push('sorting-brick-dying');
        return <div
          key={`${state.resetVersion}-${brick.id}`}
          data-brick-id={brick.id}
          className={classNames.join(' ')}
          style={{ ['--x' as string]: brick.x, ['--r' as string]: brick.row, ['--w' as string]: brick.w, ['--stagger' as string]: `${brick.row * 16}ms` }}
        >
          {Array.from({ length: brick.w }, (_, index) => <span className="sorting-brick-cell" key={index}><span className="sorting-brick-stud" /></span>)}
        </div>;
      })}
    </div>
  </section>;
}
