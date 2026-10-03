import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { clamp, resolveDrop, type Brick, type Drop, type Motion } from './bricks';

type Options = {
  stageRef: RefObject<HTMLDivElement | null>;
  bricks: Brick[];
  cols: number;
  rows: number;
  enabled: boolean;
  /** Changing this cancels any drag in progress (new wall, resize...). */
  resetKey: number;
  /** Called only when the hovered slot changes, never per frame. */
  onPreview: (drop: Drop | null, heldId: number) => void;
  onRelease: (id: number, drop: Drop | null, travel: number, motion: Motion) => void;
};

type Held = {
  id: number;
  pointerId: number;
  el: HTMLElement;
  brick: Brick;
  cell: number;
  grabX: number; // pointer offset inside the brick
  grabY: number;
  tx: number; // where the pointer wants the brick (px, stage space)
  ty: number;
  x: number; // where the brick actually is (spring-simulated)
  y: number;
  vx: number;
  vy: number;
  rot: number;
  mass: number;
  last: number;
  raf: number;
  slot: string;
};

/**
 * Heavier (wider) bricks follow the pointer through a softer spring, so they lag,
 * overshoot slightly and tilt with their velocity. The brick is moved imperatively
 * (inline `translate` / `rotate`), so React never re-renders while you drag.
 */
export function useBrickDrag(options: Options) {
  const live = useRef(options);
  useEffect(() => {
    live.current = options;
  });
  const held = useRef<Held | null>(null);

  const stop = useCallback(() => {
    const h = held.current;
    if (!h) return;
    cancelAnimationFrame(h.raf);
    held.current = null;
    h.el.removeAttribute('data-held');
    h.el.style.translate = '';
    h.el.style.rotate = '';
  }, []);

  useEffect(() => stop, [options.resetKey, stop]);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const o = live.current;
    const stage = o.stageRef.current;
    if (!o.enabled || held.current || !stage || e.button !== 0) return;

    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-brick-id]');
    const brick = el && o.bricks.find((b) => b.id === Number(el.dataset.brickId));
    if (!el || !brick) return;

    const sr = stage.getBoundingClientRect();
    const br = el.getBoundingClientRect();
    const h: Held = {
      id: brick.id,
      pointerId: e.pointerId,
      el,
      brick,
      cell: sr.width / o.cols,
      grabX: e.clientX - br.left,
      grabY: e.clientY - br.top,
      tx: br.left - sr.left,
      ty: br.top - sr.top,
      x: br.left - sr.left,
      y: br.top - sr.top,
      vx: 0,
      vy: 0,
      rot: 0,
      mass: 0.7 + 0.3 * brick.w,
      last: performance.now(),
      raf: 0,
      slot: '',
    };
    held.current = h;
    el.setAttribute('data-held', '');
    el.style.translate = `${h.x}px ${h.y}px`;
    e.currentTarget.setPointerCapture(e.pointerId);

    const frame = (now: number) => {
      if (held.current !== h) return;
      const dt = Math.min(0.032, (now - h.last) / 1000 || 0.016);
      h.last = now;

      // critically-damped-ish spring: stiffness falls with mass, damping ratio ~0.75
      const k = 420 / h.mass;
      const c = 2 * Math.sqrt(k) * 0.75;
      h.vx += ((h.tx - h.x) * k - h.vx * c) * dt;
      h.vy += ((h.ty - h.y) * k - h.vy * c) * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.rot += (clamp(h.vx * 0.004, -6, 6) - h.rot) * Math.min(1, dt * 10);

      h.el.style.translate = `${h.x}px ${h.y}px`;
      h.el.style.rotate = `${h.rot}deg`;

      // which slot would we land in? Only tell React when it changes.
      // NOTE: the slot follows the pointer (tx/ty), not the lagging spring
      // position (x/y) — otherwise a quick downward flick releases into a
      // stale, occupied cell and the brick wrongly springs back.
      const { rows, cols, bricks, onPreview } = live.current;
      const cx = Math.round(h.tx / h.cell);
      const cy = rows - 1 - Math.round(h.ty / h.cell);
      const slot = `${cx}:${cy}`;
      if (slot !== h.slot) {
        h.slot = slot;
        const drop = resolveDrop(bricks, h.id, cx, cy, cols, rows);
        onPreview(drop.kind === 'none' ? null : drop, h.id);
      }
      h.raf = requestAnimationFrame(frame);
    };
    h.raf = requestAnimationFrame(frame);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const h = held.current;
    const stage = live.current.stageRef.current;
    if (!h || !stage || e.pointerId !== h.pointerId) return;
    const sr = stage.getBoundingClientRect();
    h.cell = sr.width / live.current.cols;
    h.tx = clamp(e.clientX - sr.left - h.grabX, 0, sr.width - h.brick.w * h.cell);
    h.ty = clamp(e.clientY - sr.top - h.grabY, 0, sr.height - h.cell);
  }, []);

  const finish = useCallback((e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const h = held.current;
    if (!h || e.pointerId !== h.pointerId) return;
    cancelAnimationFrame(h.raf);
    held.current = null;

    const { bricks, cols, rows, onRelease } = live.current;
    // Release where the pointer is (tx/ty), not where the lagging spring
    // happened to be — a fast downward flick must not resolve into the
    // occupied cell the brick just left. Travel keeps the visual distance
    // so the settle animation still matches what the hand just did.
    const cx = Math.round(h.tx / h.cell);
    const cy = rows - 1 - Math.round(h.ty / h.cell);
    const raw = cancelled ? null : resolveDrop(bricks, h.id, cx, cy, cols, rows);
    const drop = raw && raw.kind !== 'none' ? raw : null;

    // distance from where the brick is now to where it will end up (cells)
    const fx = (drop ? drop.x : h.brick.x) * h.cell;
    const fy = (rows - 1 - (drop ? drop.row : h.brick.row)) * h.cell;
    const travel = Math.hypot(h.x - fx, h.y - fy) / h.cell;
    const motion: Motion = fy > h.y + 1 ? 'fall' : travel > 0.05 ? 'glide' : 'none';

    // Drop the inline overrides in the same tick React commits the new layout:
    // the CSS `translate` transition then carries the brick from where your hand
    // left it to its slot.
    h.el.removeAttribute('data-held');
    h.el.style.translate = '';
    h.el.style.rotate = '';
    onRelease(h.id, drop, travel, motion);
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: useCallback((e: ReactPointerEvent<HTMLDivElement>) => finish(e, false), [finish]),
    onPointerCancel: useCallback((e: ReactPointerEvent<HTMLDivElement>) => finish(e, true), [finish]),
  };
}
