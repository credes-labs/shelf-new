"use client";

import type { AnchorHTMLAttributes } from "react";
import styles from "./BookDemoButton.module.css";

// 4 cols x 5 rows dot-matrix chevron. [col, row]
const DOTS: [number, number][] = [
  [0, 0], [1, 0],
  [1, 1], [2, 1],
  [2, 2], [3, 2],
  [1, 3], [2, 3],
  [0, 4], [1, 4],
];
const ARROWS = 7;
const STEP = 5; // dot spacing (px @ 24px font)
const R = 1.75; // dot radius

function Arrow({ index }: { index: number }) {
  return (
    <svg
      className={styles.arrow}
      viewBox={`0 0 ${R * 2 + STEP * 3} ${R * 2 + STEP * 4}`}
      aria-hidden="true"
    >
      {DOTS.map(([c, r]) => (
        <circle
          key={`${c}-${r}`}
          className={styles.dot}
          cx={R + c * STEP}
          cy={R + r * STEP}
          r={R}
          style={{ animationDelay: `${-(2 - (index * 0.22 + c * 0.07)) }s` }}
        />
      ))}
    </svg>
  );
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Font size in px — the whole button scales with it. Default 24. */
  size?: number;
};

export default function BookDemoButton({
  children = "Book a demo",
  size = 24,
  className,
  style,
  href = "#",
  ...rest
}: Props) {
  return (
    <a
      href={href}
      className={[styles.btn, className].filter(Boolean).join(" ")}
      style={{ fontSize: size, ...style }}
      {...rest}
    >
      <span className={styles.tile} aria-hidden="true">
        {Array.from({ length: ARROWS }, (_, i) => (
          <Arrow key={i} index={i} />
        ))}
      </span>
      <span className={styles.label}>{children}</span>
    </a>
  );
}
