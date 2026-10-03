'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { CSSProperties, TransitionEvent } from 'react';
import styles from './BrickFooter.module.css';
import {
  CLEAR_MS,
  STAGGER_MS,
  annotate,
  clearOrder,
  findClears,
  generate,
  layoutFor,
  moveMs,
  settle,
  type Brick,
  type Drop,
  type Motion,
} from '../lib/bricks';
import { useBrickDrag } from '../lib/useBrickDrag';
import { SOCIALS, SocialGlyph, socialLabel } from './SocialIcons';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ---------- state: a tiny phase machine (idle -> moving -> clearing -> moving -> ...) ---------- */

type Phase = 'idle' | 'moving' | 'clearing';
type State = {
  bricks: Brick[];
  cols: number;
  rows: number;
  phase: Phase;
  wait: number; // ms until the phase's follow-up step
  stamp: number; // bumps on every phase entry so the timer effect re-arms
  dying: number[];
  epoch: number; // bumps whenever a new wall is generated
};
type Action =
  | { type: 'layout'; cols: number; rows: number }
  | { type: 'reset' }
  | { type: 'release'; id: number; drop: Drop | null; travel: number; motion: Motion }
  | { type: 'check' }
  | { type: 'settle' };

const empty: State = { bricks: [], cols: 0, rows: 0, phase: 'idle', wait: 0, stamp: 0, dying: [], epoch: 0 };

const fresh = (s: State, cols: number, rows: number): State => ({
  ...s, bricks: generate(cols, rows), cols, rows, phase: 'idle', wait: 0, dying: [], stamp: s.stamp + 1, epoch: s.epoch + 1,
});

const commit = (s: State, bricks: Brick[]): State => ({
  ...s,
  bricks,
  dying: [],
  phase: 'moving',
  wait: Math.max(120, ...bricks.map((b) => moveMs(b.travel))) + 60,
  stamp: s.stamp + 1,
});

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'layout':
      return a.cols === s.cols && a.rows === s.rows ? s : fresh(s, a.cols, a.rows);
    case 'reset':
      return fresh(s, s.cols, s.rows);
    case 'release': {
      const tag = (b: Brick) => (b.id === a.id ? { ...b, travel: a.travel, motion: a.motion } : b);
      if (!a.drop) return { ...s, bricks: s.bricks.map(tag) }; // spring back, nothing else changes
      return commit(s, annotate(s.bricks, a.drop.bricks).map(tag));
    }
    case 'check': {
      const dead = findClears(s.bricks, s.cols);
      if (!dead.size) return { ...s, phase: 'idle' };
      const last = Math.max(...Array.from(clearOrder(s.bricks, Array.from(dead)).values()));
      return { ...s, dying: Array.from(dead), phase: 'clearing', wait: CLEAR_MS + last * STAGGER_MS + 40, stamp: s.stamp + 1 };
    }
    case 'settle': {
      const dead = new Set(s.dying);
      const rest = s.bricks.filter((b) => !dead.has(b.id));
      return commit(s, annotate(rest, settle(rest, s.cols)));
    }
  }
}

/* ---------- landing squash (imperative: no React state, no re-render) ---------- */

function thud(el: HTMLElement) {
  const fell = el.dataset.motion === 'fall' || el.dataset.intro;
  if (!fell || typeof el.animate !== 'function') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const now = performance.now();
  if (now - Number(el.dataset.thud || 0) < 80) return;
  el.dataset.thud = String(now);

  const w = Number(el.dataset.w) || 1;
  const travel = Number(el.dataset.travel) || 6;
  // farther fall + wider brick = harder landing
  const a = Math.min(0.1, 0.02 + Math.sqrt(travel) * 0.014) * (0.8 + w * 0.08);
  const base = { transformOrigin: '50% 100%' }; // squash against the floor, not the middle
  el.animate(
    [
      { ...base, scale: '1 1' },
      { ...base, scale: `${1 + a * 0.6} ${1 - a}`, offset: 0.28 },
      { ...base, scale: `${1 - a * 0.2} ${1 + a * 0.3}`, offset: 0.6 },
      { ...base, scale: '1 1' },
    ],
    { duration: 300 + w * 25, easing: 'cubic-bezier(.2,.7,.3,1)' },
  );
}

/* ---------- component ---------- */

type Intro = 'pre' | 'in' | 'done';

export default function BrickFooter() {
  const [state, dispatch] = useReducer(reducer, empty);
  const [intro, setIntro] = useState<Intro>('pre');
  const [preview, setPreview] = useState<{ heldId: number; drop: Drop } | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const introTimer = useRef(0);

  // measure -> (re)build the wall only when the column/row count actually changes
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const measure = () => dispatch({ type: 'layout', ...layoutFor(el.clientWidth) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // step the phase machine
  useEffect(() => {
    if (state.phase === 'idle') return;
    const t = window.setTimeout(
      () => dispatch({ type: state.phase === 'moving' ? 'check' : 'settle' }),
      state.wait,
    );
    return () => window.clearTimeout(t);
  }, [state.phase, state.stamp, state.wait]);

  // intro: bricks rain in the first time the footer scrolls into view (and after a reset)
  const play = useCallback(() => {
    window.clearTimeout(introTimer.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setIntro('done');
    setIntro('pre');
    requestAnimationFrame(() => requestAnimationFrame(() => setIntro('in')));
    introTimer.current = window.setTimeout(() => setIntro('done'), 1900);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      seen.current = true;
      play();
      io.disconnect();
    }, { threshold: 0.35 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(introTimer.current);
    };
  }, [play]);

  // layout effect so a regenerated wall never paints once without its intro state
  useIsoLayoutEffect(() => {
    if (seen.current) play();
  }, [state.epoch, play]);

  const drag = useBrickDrag({
    stageRef,
    bricks: state.bricks,
    cols: state.cols,
    rows: state.rows,
    enabled: state.phase === 'idle' && intro === 'done',
    resetKey: state.epoch,
    onPreview: (drop, heldId) => setPreview(drop ? { heldId, drop } : null),
    onRelease: (id, drop, travel, motion) => {
      setPreview(null);
      dispatch({ type: 'release', id, drop, travel, motion });
    },
  });

  const dying = useMemo(() => new Set(state.dying), [state.dying]);
  const order = useMemo(() => clearOrder(state.bricks, state.dying), [state.bricks, state.dying]);
  const heldColor = preview && state.bricks.find((b) => b.id === preview.heldId)?.color;
  const rows = state.rows || 8;

  const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && e.propertyName === 'translate') thud(e.currentTarget);
  };

  const slot = (x: number, row: number, w: number) =>
    ({ '--x': x, '--y': rows - 1 - row, '--w': w }) as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Shelf footer with brick puzzle"
      style={{ '--cols': state.cols || 28, '--rows': rows, '--clear-ms': `${CLEAR_MS}ms`, '--stagger': `${STAGGER_MS}ms` } as CSSProperties}
    >
      <div className={styles.footerContent}>
        <nav className={styles.socials} aria-label="Social links">
          {SOCIALS.map((name) => (
            <a key={name} href={`#${name}`} aria-label={socialLabel(name)}>
              <SocialGlyph name={name} />
            </a>
          ))}
        </nav>
        <p className={styles.copyright}>© Credes Techlabs 2026</p>
        <div className={styles.links}>
          <div>
            <span>Company</span>
            <a href="/about">About us</a>
            <a href="/contact">Contact</a>
            <a href="/security">Security</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="/terms">Terms and Conditions</a>
          </div>
          <div>
            <span>Download</span>
            <a href="#ios">iOS</a>
            <a href="#web">Web</a>
            <a href="#macos">Mac os</a>
          </div>
        </div>
      </div>

      <div className={styles.gameWrap}>
        <div className={styles.hint}>
          <span>Drag | Match a full row</span>
          <button type="button" onClick={() => dispatch({ type: 'reset' })}>Reset</button>
        </div>

        <div ref={stageRef} className={styles.stage} aria-hidden="true" {...drag}>
          {/* Lives inside the stage so it inherits --cell: exactly three rows
              tall, fully covered by the wall until rows clear. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.halfCut} src="/svg/shelf%20footer%20halfcut%20text.svg" alt="" aria-hidden="true" draggable={false} />
        {preview && heldColor && preview.drop.kind === 'place' && (
          <div className={`${styles.ghost} ${styles.tone}`} data-color={heldColor} style={slot(preview.drop.x, preview.drop.row, state.bricks.find((b) => b.id === preview.heldId)!.w)} />
        )}

        {state.bricks.map((b) => (
          <div
            key={`${state.epoch}-${b.id}`}
            className={[
              styles.brick,
              styles.tone,
              dying.has(b.id) && styles.dying,
              preview?.drop.swapId === b.id && styles.swapTarget,
            ].filter(Boolean).join(' ')}
            data-brick-id={b.id}
            data-color={b.color}
            data-w={b.w}
            data-travel={b.travel}
            data-motion={b.motion}
            data-intro={intro === 'done' ? undefined : intro}
            style={{
              ...slot(b.x, b.row, b.w),
              '--ms': `${moveMs(b.travel)}ms`,
              '--d': intro === 'in' ? `${b.row * 90 + (b.x % 7) * 16}ms` : '0ms',
              '--i': order.get(b.id) ?? 0,
            } as CSSProperties}
            onTransitionEnd={onTransitionEnd}
          >
            {Array.from({ length: b.w }, (_, i) => (
              <span className={styles.cell} key={i}><i className={styles.stud} /></span>
            ))}
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
