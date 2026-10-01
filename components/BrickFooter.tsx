'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { createBricks, moveBrick, type Brick } from '../lib/bricks';
import styles from './BrickFooter.module.css';

type SocialName = 'instagram' | 'threads' | 'pinterest' | 'x' | 'linkedin' | 'facebook';

function SocialGlyph({ name }: { name: SocialName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'instagram' && <><rect x="3.3" y="3.3" width="17.4" height="17.4" rx="5" /><circle cx="12" cy="12" r="4.1" /><circle cx="17.7" cy="6.6" r=".8" fill="currentColor" stroke="none" /></>}
    {name === 'threads' && <path d="M18.8 10.2c-.6-4.3-3-6.6-6.9-6.6-4.5 0-7.2 3.2-7.2 8.4 0 5.4 2.6 8.5 7.1 8.5 3.6 0 6.2-1.8 6.2-4.7 0-2.4-1.6-3.8-4.4-3.8-2.4 0-3.8 1-3.8 2.6 0 1.3 1 2.2 2.4 2.2 1.9 0 3.1-1.5 3.1-3.9 0-3.3-1.6-5.1-4.5-5.1-1.5 0-2.8.6-3.8 1.7" />}
    {name === 'pinterest' && <path d="M12 21a9 9 0 1 0-3.8-.8l1.4-5.8s.8 1.5 3 1.5c3.1 0 5.3-2.8 5.3-6.5 0-3.2-2.7-5.5-6.3-5.5-4.4 0-6.7 3.1-6.7 6.2 0 1.5.6 3 1.8 3.5.2.1.4 0 .5-.2l.3-1.2c.1-.2 0-.4-.1-.6-.4-.5-.7-1.2-.7-2.2 0-2.8 2.1-5.3 5.6-5.3 3 0 4.7 1.8 4.7 4.3 0 3.2-1.4 5.9-3.6 5.9-1.2 0-2.1-1-1.8-2.2.3-1.5 1-3.1 1-4.2 0-1-.5-1.8-1.6-1.8-1.3 0-2.3 1.3-2.3 3 0 1.1.4 1.9.4 1.9l-1.5 6.3" />}
    {name === 'x' && <><path d="M4 4l16 16" /><path d="M20 4 4 20" /></>}
    {name === 'linkedin' && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7.5 10v7M7.5 7.2v.1M11 17v-7h3.3v1.1c.5-.8 1.3-1.3 2.4-1.3 2 0 2.8 1.3 2.8 3.5V17M11 13.1c0-1.7 1-3.3 3.1-3.3" /></>}
    {name === 'facebook' && <><circle cx="12" cy="12" r="9" /><path d="M13.2 20.8v-7.4h2.5l.4-2.8h-2.9V8.8c0-.8.2-1.4 1.4-1.4h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v1.7H7.2v2.8h2.6v7.4" /></>}
  </svg>;
}

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
      <nav className={styles.socials} aria-label="Social links">
        {(['instagram', 'threads', 'pinterest', 'x', 'linkedin', 'facebook'] as const).map(name => <a key={name} href={`#${name}`} aria-label={name === 'x' ? 'X' : name[0].toUpperCase() + name.slice(1)}><SocialGlyph name={name} /></a>)}
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
