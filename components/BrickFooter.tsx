'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { createBricks, moveBrick, type Brick } from '../lib/bricks';
import ScrollShelfLogo from './ScrollShelfLogo';
import styles from './BrickFooter.module.css';

type State = { bricks: Brick[]; removed: Brick[]; cols: number; width: number };
type Action = { type: 'resize'; cols: number; width: number } | { type: 'move'; id: number; x: number; row?: number } | { type: 'reset' } | { type: 'clear-animation' };
function reducer(state: State, action: Action): State {
  if (action.type === 'resize') return action.cols === state.cols ? { ...state, width: action.width } : { bricks: createBricks(action.cols), removed: [], cols: action.cols, width: action.width };
  if (action.type === 'reset') return { ...state, bricks: createBricks(state.cols, Date.now() % 100000), removed: [] };
  if (action.type === 'clear-animation') return { ...state, removed: [] };
  const bricks = moveBrick(state.bricks, action.id, action.x, state.cols, action.row);
  const alive = new Set(bricks.map(brick => brick.id));
  const removed = state.bricks.filter(brick => !alive.has(brick.id));
  return { ...state, bricks, removed };
}

export default function BrickFooter() {
  const [state, dispatch] = useReducer(reducer, { bricks: createBricks(20), removed: [], cols: 20, width: 0 });
  const [cell, setCell] = useState(52);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; pointerId: number; startX: number; startY: number; originX: number; originRow: number; width: number; element: HTMLElement } | null>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const targetUnit = Math.max(44, Math.min(66, width * .035));
      const mobile = window.matchMedia('(max-width: 700px)').matches;
      const cols = mobile ? Math.max(1, Math.floor(width / targetUnit)) : Math.ceil(width / targetUnit) + 2;
      const unit = mobile ? width / cols : targetUnit;
      setCell(unit);
      dispatch({ type: 'resize', cols, width });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!state.removed.length) return;
    const timer = window.setTimeout(() => dispatch({ type: 'clear-animation' }), 720);
    return () => window.clearTimeout(timer);
  }, [state.removed]);

  const pointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    let dx = event.clientX - current.startX;
    let dy = event.clientY - current.startY;
    if (window.matchMedia('(max-width: 700px)').matches) {
      dx = Math.max(-current.originX * cell, Math.min((state.cols - current.originX - current.width) * cell, dx));
      dy = Math.max(-(8 - current.originRow) * cell, Math.min(current.originRow * cell, dy));
    }
    current.element.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  }, [cell, state.cols]);
  const startDrag = (event: React.PointerEvent<HTMLDivElement>, brick: Brick) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    stage.setPointerCapture(event.pointerId);
    const element = event.currentTarget;
    element.dataset.held = 'true';
    drag.current = { id: brick.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: brick.x, originRow: brick.row, width: brick.width, element };
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    let dx = event.clientX - current.startX;
    let dy = event.clientY - current.startY;
    if (window.matchMedia('(max-width: 700px)').matches) {
      dx = Math.max(-current.originX * cell, Math.min((state.cols - current.originX - current.width) * cell, dx));
      dy = Math.max(-(8 - current.originRow) * cell, Math.min(current.originRow * cell, dy));
    }
    const x = Math.max(0, Math.min(state.cols - current.width, current.originX + Math.round(dx / cell)));
    const row = Math.max(0, Math.min(8, current.originRow - Math.round(dy / cell)));
    // Keep the brick under the pointer through the layout commit, then let its
    // transform ease into the committed cell position.
    current.element.style.transform = `translate3d(${dx + (current.originX - x) * cell}px, ${(current.originRow - row) * cell - dy}px, 0)`;
    delete current.element.dataset.held;
    drag.current = null;
    dispatch({ type: 'move', id: current.id, x, row });
    requestAnimationFrame(() => { current.element.style.transform = ''; });
  };

  return <footer className={styles.footer}>
    <div className={styles.footerContent}>
      <a href="#top" className={styles.logo} aria-label="Shelf home"><ScrollShelfLogo /></a>
      <nav className={styles.socials} aria-label="Social links">
        <a href="#instagram" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="/svg/social%20media%20icons.svg#instagram" /></svg></a>
        <a href="#threads" aria-label="Threads"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="/svg/social%20media%20icons.svg#threads" /></svg></a>
        <a href="#pinterest" aria-label="Pinterest"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="/svg/social%20media%20icons.svg#pinterest" /></svg></a>
        <a href="#x" aria-label="X"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="/svg/social%20media%20icons.svg#x" /></svg></a>
        <a href="#linkedin" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="/svg/social%20media%20icons.svg#linkedin" /></svg></a>
        <a href="#facebook" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="/svg/social%20media%20icons.svg#facebook" /></svg></a>
      </nav>
      <p className={styles.copyright}>© Credes Techlabs 2026</p>
      <div className={styles.links}><div><span>Company</span><a href="#about">About us</a><a href="#contact">Contact</a><a href="#security">Security</a><a href="#privacy">Privacy Policy</a><a href="#terms">Terms and Conditions</a></div><div><span>Download</span><a href="#ios">iOS</a><a href="#web">Web</a><a href="#macos">Mac OS</a></div></div>
    </div>
    <div className={styles.gameHint}><span>Drag · same-color rows drop</span><button type="button" onClick={() => dispatch({ type: 'reset' })}>Reset</button></div>
    <img className={styles.halfCut} src="/svg/shelf%20footer%20halfcut%20text.svg" alt="" aria-hidden="true" />
    <div ref={stageRef} className={styles.stage} style={{ '--cell': `${cell}px`, '--cols': state.cols, '--wall-height': `${cell * 9}px` } as React.CSSProperties} onPointerMove={pointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} aria-label="Interactive brick sorting game">
      <div className={styles.wall} style={{ width: `${state.cols * cell}px`, height: `${cell * 9}px`, left: `calc(50% - ${state.cols * cell / 2}px)` }} aria-hidden="true">
        {[...state.bricks.map(brick => ({ brick, clearing: false })), ...state.removed.map(brick => ({ brick, clearing: true }))].map(({ brick, clearing }) => <div key={brick.id} className={`${styles.brick}${clearing ? ` ${styles.clearing}` : ''}`} data-color={brick.color} data-brick-id={brick.id} onPointerDown={event => !clearing && startDrag(event, brick)} style={{ left: `${brick.x * cell}px`, bottom: `${brick.row * cell}px`, width: `${brick.width * cell}px`, height: `${cell}px`, '--clear-x': brick.x } as React.CSSProperties}><span className={styles.studs}>{Array.from({ length: brick.width }, (_, i) => <i key={i} />)}</span></div>)}
      </div>
    </div>
  </footer>;
}
