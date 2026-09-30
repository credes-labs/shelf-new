'use client';

import { PointerEvent, useEffect, useReducer, useRef, useState } from 'react';
import Image from 'next/image';
import { Brick, clearAndSettle, COLS, findClears, generate, moveBrick, ROWS, SEED } from '@/lib/bricks';

type State = { bricks: Brick[]; draggingId: number | null; dyingIds: number[]; resetVersion: number };
type Action =
  | { type: 'start'; id: number }
  | { type: 'move'; id: number; x: number; row: number; rows: number }
  | { type: 'drop'; id: number }
  | { type: 'settle' }
  | { type: 'resize'; rows: number }
  | { type: 'reset' };

const initialState: State = { bricks: generate(SEED), draggingId: null, dyingIds: [], resetVersion: 0 };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start': return { ...state, draggingId: action.id };
    case 'move': return state.draggingId === action.id
      ? { ...state, bricks: moveBrick(state.bricks, action.id, action.x, action.row, COLS, action.rows) }
      : state;
    case 'drop': {
      const clears = findClears(state.bricks);
      return clears.size
        ? { ...state, draggingId: null, dyingIds: Array.from(clears) }
        : { ...state, draggingId: null };
    }
    case 'settle': return { ...state, bricks: clearAndSettle(state.bricks), dyingIds: [] };
    case 'resize': {
      if (state.bricks.every((brick) => brick.row < action.rows)) return state;
      const bricks = state.bricks.map((brick) => ({ ...brick, row: Math.min(brick.row, action.rows - 1) }));
      return { ...state, bricks: clearAndSettle(bricks), draggingId: null };
    }
    case 'reset': return { bricks: generate(SEED), draggingId: null, dyingIds: [], resetVersion: state.resetVersion + 1 };
  }
}

export default function BrickFooter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [cellSize, setCellSize] = useState(36);
  const [rowCount, setRowCount] = useState(ROWS);
  const sectionRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef(36);
  const rowsRef = useRef(ROWS);
  const dragRef = useRef<{
    id: number; offsetX: number; offsetY: number; lastX: number; lastRow: number;
    visualX: number; visualY: number; element: HTMLElement;
  } | null>(null);
  const dying = new Set(state.dyingIds);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const readBoardSize = () => {
      const width = section.clientWidth;
      const nextCellSize = Math.min(50, width / COLS);
      const nextRowCount = width < 390 ? 6 : width < 620 ? 7 : ROWS;
      cellRef.current = nextCellSize;
      rowsRef.current = nextRowCount;
      setCellSize((current) => Math.abs(current - nextCellSize) < 0.1 ? current : nextCellSize);
      setRowCount((current) => current === nextRowCount ? current : nextRowCount);
    };
    readBoardSize();
    const observer = new ResizeObserver(readBoardSize);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    dispatch({ type: 'resize', rows: rowCount });
  }, [rowCount]);

  useEffect(() => {
    if (!state.dyingIds.length) return;
    const timer = window.setTimeout(() => dispatch({ type: 'settle' }), 340);
    return () => window.clearTimeout(timer);
  }, [state.dyingIds]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const element = target.closest<HTMLElement>('[data-brick-id]');
    if (!element || state.dyingIds.length) return;
    const wall = wallRef.current;
    if (!wall) return;
    const unit = cellRef.current;
    const brickRect = element.getBoundingClientRect();
    const x = Number(element.dataset.x);
    const row = Number(element.dataset.row);
    const offsetX = event.clientX - brickRect.left;
    const offsetY = event.clientY - brickRect.top;
    const visualX = x * unit;
    const visualY = (rowsRef.current - 1 - row) * unit;
    dragRef.current = { id: Number(element.dataset.brickId), offsetX, offsetY, lastX: x, lastRow: row, visualX, visualY, element };
    dispatch({ type: 'start', id: Number(element.dataset.brickId) });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = dragRef.current;
    const wall = wallRef.current;
    if (!current || !wall) return;
    const unit = cellRef.current;
    const wallRect = wall.getBoundingClientRect();
    const width = Number(current.element.dataset.w);
    const visualX = Math.max(0, Math.min((COLS - width) * unit, event.clientX - wallRect.left - current.offsetX));
    const visualY = Math.max(0, Math.min((rowsRef.current - 1) * unit, event.clientY - wallRect.top - current.offsetY));
    const x = Math.round(visualX / unit);
    const row = rowsRef.current - 1 - Math.round(visualY / unit);

    if (x !== current.lastX || row !== current.lastRow) {
      const next = moveBrick(state.bricks, current.id, x, row, COLS, rowsRef.current);
      const moved = next.find((brick) => brick.id === current.id);
      if (moved && moved.x === x && moved.row === row) {
        current.lastX = x;
        current.lastRow = row;
        current.visualX = visualX;
        current.visualY = visualY;
        dispatch({ type: 'move', id: current.id, x, row, rows: rowsRef.current });
      } else {
        current.visualX = current.lastX * unit;
        current.visualY = (rowsRef.current - 1 - current.lastRow) * unit;
      }
    } else {
      current.visualX = visualX;
      current.visualY = visualY;
    }
    requestAnimationFrame(() => {
      if (dragRef.current === current) current.element.style.transform = `translate3d(${current.visualX}px, ${current.visualY}px, 0)`;
    });
  }

  function onPointerUp() {
    const current = dragRef.current;
    dragRef.current = null;
    if (!current) return;
    const brick = state.bricks.find((item) => item.id === current.id);
    if (brick) {
      current.element.style.transition = 'transform 320ms cubic-bezier(.2,.8,.2,1)';
      void current.element.getBoundingClientRect();
      current.element.style.transform = `translate3d(${brick.x * cellRef.current}px, ${(rowsRef.current - 1 - brick.row) * cellRef.current}px, 0)`;
      window.setTimeout(() => current.element.style.removeProperty('transition'), 340);
    }
    dispatch({ type: 'drop', id: current.id });
  }

  return <section ref={sectionRef} className="brick-footer" aria-label="Sort the bricks" style={{ height: `${cellSize * rowCount}px` }}>
    <Image className="brick-footer-art" src="/svg/shelf-footer.svg" alt="" aria-hidden="true" width={932} height={146} unoptimized />
    <div className="brick-footer-hint">
      <span>Drag | Match a full row</span>
      <button type="button" onClick={() => { dragRef.current = null; dispatch({ type: 'reset' }); }}>Reset</button>
    </div>
    <div
      ref={wallRef}
      className={`brick-wall${state.resetVersion ? ' brick-wall-has-reset' : ''}`}
      aria-hidden="true"
      style={{
        ['--rows' as string]: rowCount,
        ['--reset-version' as string]: state.resetVersion,
        width: `${cellSize * COLS}px`,
        height: `${cellSize * rowCount}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {state.bricks.map((brick) => {
        const isDragging = state.draggingId === brick.id;
        const classNames = ['sorting-brick', `sorting-brick-${brick.color}`];
        if (isDragging) classNames.push('sorting-brick-dragging');
        if (dying.has(brick.id)) classNames.push('sorting-brick-dying');
        return <div
          key={`${state.resetVersion}-${brick.id}`}
          data-brick-id={brick.id}
          data-x={brick.x}
          data-row={brick.row}
          data-w={brick.w}
          className={classNames.join(' ')}
          style={{
            transform: `translate3d(${brick.x * cellSize}px, ${(rowCount - 1 - brick.row) * cellSize}px, 0)`,
            width: `${brick.w * cellSize}px`,
            height: `${cellSize}px`,
            ['--stagger' as string]: `${brick.row * 16}ms`,
          }}
        >
          {Array.from({ length: brick.w }, (_, index) => <span className="sorting-brick-cell" key={index}><span className="sorting-brick-stud" /></span>)}
        </div>;
      })}
    </div>
  </section>;
}
