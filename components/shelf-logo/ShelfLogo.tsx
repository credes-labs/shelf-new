"use client";

import { useEffect, useId, useRef } from "react";
import { CUBE, LETTERS, TRACK_TRANSFORM, WINDOWS } from "./shelf-logo-paths";

const UX = 0.866; // forward direction along the cube's diagonal edges
const UY = 0.5;
const LOOP = 40; // travel distance (SVG units) before a panel wraps
const PX_PER_LOOP = 480; // pixels of scrolling per loop

type Props = {
  className?: string;
  /** Pass false to render the logo without animation. */
  animate?: boolean;
};

export function ShelfLogo({ className, animate = true }: Props) {
  const uid = useId().replace(/:/g, "");
  const clipId = `shelf-track-${uid}`;
  const maskId = `shelf-cut-${uid}`;
  // Indexes 0-2: the three panels. 3-5: copies that trail one loop behind.
  const panels = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let progress = 0;
    let shown = 0;
    let lastY = window.scrollY;
    let tickY = lastY;
    let pending = 0;
    let lastTouchY: number | null = null;
    let raf = 0;

    const place = (el: SVGPathElement | null, s: number) => {
      el?.setAttribute("transform", `translate(${(UX * s).toFixed(3)} ${(UY * s).toFixed(3)})`);
    };
    const tick = () => {
      // Absolute resync: scroll deltas telescope, so folding the live scroll
      // position in every frame keeps progress drift-proof even if scroll
      // events are coalesced or missed (sticky heroes, momentum, iframes).
      // Scroll events stay authoritative when the document moves; wheel/touch
      // deltas also cover embedded scrolling contexts where window.scrollY stays put.
      const y = window.scrollY;
      progress += y - lastY;
      lastY = y;
      if (y === tickY) progress += pending;
      tickY = y;
      pending = 0;
      const target = progress / PX_PER_LOOP;
      shown += (target - shown) * 0.12;
      // Snap when converged so the loop settles instead of easing forever.
      if (Math.abs(target - shown) < 0.0005) shown = target;
      const f = ((shown % 1) + 1) % 1;
      for (let k = 0; k < WINDOWS.length; k++) {
        place(panels.current[k], f * LOOP);
        place(panels.current[k + WINDOWS.length], (f - 1) * LOOP);
      }
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      progress += window.scrollY - lastY;
      lastY = window.scrollY;
    };
    const onWheel = (event: WheelEvent) => {
      pending += event.deltaY;
    };
    const onTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined) return;
      if (lastTouchY !== null) pending += lastTouchY - currentY;
      lastTouchY = currentY;
    };
    const resync = () => {
      // Resize/pageshow can jump the scroll position without scroll events firing.
      lastY = window.scrollY;
      tickY = window.scrollY;
      pending = 0;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", resync);
    window.addEventListener("pageshow", resync);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", resync);
      window.removeEventListener("pageshow", resync);
    };
  }, [animate]);

  return (
    <svg
      className={className}
      viewBox="0 0 124 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="shelf"
    >
      <defs>
        <clipPath id={clipId}>
          <path transform={TRACK_TRANSFORM} d={CUBE} />
        </clipPath>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-5} y={-5} width={50} height={52}>
          <rect x={-5} y={-5} width={50} height={52} fill="#fff" />
          <g clipPath={`url(#${clipId})`} fill="#000">
            {[...WINDOWS, ...WINDOWS].map((d, i) => (
              <path
                key={i}
                d={d}
                ref={(el) => {
                  panels.current[i] = el;
                }}
              />
            ))}
          </g>
        </mask>
      </defs>
      <path fill="currentColor" mask={`url(#${maskId})`} d={CUBE} />
      {LETTERS.map((d, i) => (
        <path key={i} fill="currentColor" d={d} />
      ))}
    </svg>
  );
}
