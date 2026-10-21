'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { pixelMaze } from '../lib/pixel-maze';
import styles from './PixelMaze.module.css';

const VIOLET = '#7c3aed';
const PERIWINKLE = '#93a5fb';
const LAVENDER = '#e0e7ff';
const INDIGO = '#171343';

export default function PixelMaze() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const context = gsap.context(() => {
      if (reduced) return;

      gsap.from('[data-maze]', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });

      const cursor = svg.querySelector('[data-cursor]');
      if (!cursor) return;

      const points = pixelMaze.trail;
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
      timeline.set(cursor, { opacity: 1 });
      points.forEach(point => {
        timeline.to(cursor, {
          attr: { x: point.x - 3, y: point.y - 3 },
          duration: 0.3,
          ease: 'none',
        });
      });
      timeline.to(cursor, { opacity: 0, duration: 0.35, ease: 'power1.in' });
    }, svg);

    return () => context.revert();
  }, []);

  const { width, height, walls, fragments, trail, invader } = pixelMaze;

  return (
    <svg
      ref={svgRef}
      className={styles.maze}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="A pixel-art maze with a tiny space invader trapped at the end of the corridor"
    >
      <defs>
        <filter id="shelf-maze-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <g data-maze>
        <rect x="0" y="0" width={width} height={height} fill={INDIGO} />
        <g fill={PERIWINKLE} shapeRendering="crispEdges">
          <rect x="0" y="0" width={width} height="5" />
          <rect x="0" y={height - 5} width={width} height="5" />
          <rect x="0" y="0" width="5" height={height} />
          <rect x={width - 5} y="0" width="5" height={height} />
        </g>

        <g fill={PERIWINKLE} shapeRendering="crispEdges">
          {walls.map((wall, index) => (
            <rect key={index} x={wall.x} y={wall.y} width={wall.w} height={wall.h} />
          ))}
        </g>

        <g fill={LAVENDER} opacity="0.5" shapeRendering="crispEdges">
          {trail.map((point, index) => (
            <rect key={index} x={point.x - 2.5} y={point.y - 2.5} width="5" height="5" />
          ))}
        </g>

        <g shapeRendering="crispEdges">
          {fragments.map((fragment, index) => (
            <rect
              key={index}
              x={fragment.x}
              y={fragment.y}
              width={fragment.size}
              height={fragment.size}
              fill={fragment.tone === 'violet' ? VIOLET : PERIWINKLE}
              opacity={fragment.tone === 'violet' ? 0.9 : 0.75}
            />
          ))}
        </g>

        <g filter="url(#shelf-maze-glow)" opacity="0.75">
          <rect
            x={invader.x - 6}
            y={invader.y - 6}
            width={invader.block * 8 + 12}
            height={invader.block * 8 + 12}
            fill={VIOLET}
          />
        </g>

        <g shapeRendering="crispEdges">
          <g transform={`translate(${invader.x} ${invader.y})`}>
            {invader.pixels.map((pixel, index) => (
              <rect key={index} x={pixel.x} y={pixel.y} width={pixel.w} height={pixel.h} fill={VIOLET} />
            ))}
            {invader.eyes.map((eye, index) => (
              <rect key={index} x={eye.x} y={eye.y} width={eye.w} height={eye.h} fill={LAVENDER} />
            ))}
          </g>
        </g>

        <rect data-cursor x={trail[0].x - 3} y={trail[0].y - 3} width="6" height="6" fill={LAVENDER} opacity="0" shapeRendering="crispEdges" />
      </g>
    </svg>
  );
}
