'use client';

import { useId } from 'react';
import type { SVGProps } from 'react';

type Pt = readonly [number, number];

const INK = '#121212';
const CREAM = '#FDF0DE';
const TEAL = '#7FD0BE';
const BAR_COLORS = ['#E8CF6B', '#19E6CF', '#5DE22B', '#E960D2', '#EB4B2A', '#5B2EE8', '#0B0B0B'];

// Screen is a parallelogram: T(t) = top edge, B(t) = bottom edge, t in [0,1] left to right
const T = (t: number): Pt => [170 + 166 * t, 220 - 92 * t];
const B = (t: number): Pt => [207 + 178 * t, 390 - 90 * t];
// Point on screen: t = across, s = down
const P = (t: number, s: number): Pt => {
  const a = T(t);
  const b = B(t);
  return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
};
const pts = (...p: Pt[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

// 5x7 pixel glyphs for the "404" label
const GLYPHS: Record<string, string[]> = {
  '4': ['10010', '10010', '10010', '11111', '00010', '00010', '00010'],
  '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
};

// Map the label's local 100x40 box onto the screen so it follows the perspective
const L0 = P(0.17, 0.5);
const LX = P(0.93, 0.5);
const LY = P(0.17, 0.74);
const labelMatrix = [
  (LX[0] - L0[0]) / 100,
  (LX[1] - L0[1]) / 100,
  (LY[0] - L0[0]) / 40,
  (LY[1] - L0[1]) / 40,
  L0[0],
  L0[1],
]
  .map((n) => n.toFixed(4))
  .join(' ');

// Logo sits on the left face where the round button used to be
const LOGO_SIZE = 44;
const logoMatrix = '0.7 0.122 0 0.9 99.6 225.5';

export type RetroComputerProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Background colour of the logo tile */
  logoColor?: string;
  /** Show the black floor shadow under the machine */
  shadow?: boolean;
  /** Text on the screen label */
  label?: string;
};

export function RetroComputer({
  logoColor = '#3E9A2B',
  shadow = true,
  label = '404',
  ...props
}: RetroComputerProps) {
  const gid = `grey-${useId().replace(/:/g, '')}`;
  const chars = label.split('').filter((c) => GLYPHS[c]);
  const glyphW = 20;
  const gap = 6;
  const totalW = chars.length * glyphW + (chars.length - 1) * gap;
  const startX = (100 - totalW) / 2;

  return (
    <svg
      viewBox="66 90 350 366"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Retro computer"
      {...props}
    >
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="207" y1="0" x2="385" y2="0">
          <stop offset="0" stopColor="#0B0B0B" />
          <stop offset="0.6" stopColor="#BDBDBD" />
          <stop offset="1" stopColor="#8E8E8E" />
        </linearGradient>
      </defs>

      <g strokeLinejoin="round" strokeLinecap="round" stroke={INK} strokeWidth="2.5">
        {/* floor shadow */}
        {shadow && (
          <polygon
            points="78,388 192,446 404,338 392,318 210,408 86,380"
            fill={INK}
            stroke="none"
          />
        )}

        {/* left face */}
        <polygon points="85,196 158,216 200,410 80,386" fill={CREAM} />
        {/* panel line */}
        <path d="M83 270 L126 284 L157 268" strokeWidth="1.8" />
        {/* vents */}
        {[0, 21, 42].map((o) => (
          <polygon
            key={o}
            points={`108,${320 + o} 168,${337 + o} 168,${349 + o} 108,${332 + o}`}
            fill={INK}
          />
        ))}
        {/* screws */}
        {([[91, 207], [88, 364], [196, 404]] as Pt[]).map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill={INK} stroke="none" />
        ))}

        {/* logo tile in place of the round button */}
        <g transform={`matrix(${logoMatrix})`} stroke="none">
          <rect width={LOGO_SIZE} height={LOGO_SIZE} rx="10" fill={logoColor} />
          <g
            transform="translate(6 6) scale(0.95)"
            stroke="#fff"
            strokeWidth="2.8"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M17 3 29 10v14L17 31 5 24V10L17 3Z" />
            <path d="M5 10l12 7 12-7M17 17v14" />
            <path d="M11 6.5 23 13.5v5" strokeWidth="2.3" />
          </g>
        </g>

        {/* top teal band + top face */}
        <polygon points="85,186 158,206 158,217 85,197" fill={TEAL} />
        <polygon points="85,186 272,96 350,112 158,206" fill={CREAM} />
        <polygon points="182,140 226,119 226,129 182,150" fill={INK} stroke="none" />

        {/* bezel */}
        <polygon points="158,206 350,112 402,308 200,410" fill={TEAL} />
        {/* cream lip under screen */}
        <polygon points="205,384 386,296 389,304 208,396" fill="#F4E3B8" strokeWidth="1.5" />

        {/* screen bars */}
        {BAR_COLORS.map((c, i) => (
          <polygon
            key={c}
            points={pts(T(i / 7), T((i + 1) / 7), B((i + 1) / 7), B(i / 7))}
            fill={c}
            stroke="none"
          />
        ))}
        {/* grey ramp */}
        <polygon
          points={pts(P(0, 0.8), P(1, 0.8), P(1, 0.93), P(0, 0.93))}
          fill={`url(#${gid})`}
          stroke="none"
        />
        {/* white chip on the right */}
        <polygon
          points={pts(P(0.88, 0.62), P(0.99, 0.62), P(0.99, 0.74), P(0.88, 0.74))}
          fill="#fff"
          stroke="none"
        />
        {/* screen outline */}
        <polygon points={pts(T(0), T(1), B(1), B(0))} strokeWidth="2" />
        {/* glass curve on the right */}
        <path
          d={`M${P(0.93, 0.02)[0]} ${P(0.93, 0.02)[1]} Q${P(0.97, 0.5)[0] - 8} ${P(0.97, 0.5)[1]} ${P(0.93, 0.98)[0]} ${P(0.93, 0.98)[1]}`}
          stroke="#555"
          strokeWidth="1.4"
        />

        {/* 404 label */}
        <g transform={`matrix(${labelMatrix})`} stroke="none">
          <rect width="100" height="40" fill={INK} />
          {chars.map((ch, ci) =>
            GLYPHS[ch].flatMap((row, y) =>
              row.split('').map((v, x) =>
                v === '1' ? (
                  <rect
                    key={`${ci}-${x}-${y}`}
                    x={startX + ci * (glyphW + gap) + x * 4}
                    y={6 + y * 4}
                    width="4"
                    height="4"
                    fill="#fff"
                  />
                ) : null,
              ),
            ),
          )}
        </g>
      </g>
    </svg>
  );
}

export default RetroComputer;
