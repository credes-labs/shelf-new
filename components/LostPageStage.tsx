'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import PixelMaze from './PixelMaze';
import styles from './LostPageStage.module.css';

const stickers = [
  { name: 'photo', file: 'polaroid.svg', width: 204, height: 206, label: 'Polaroid photo', message: 'A moment worth keeping. Even without the page.', rotate: 13 },
  { name: 'receipt', file: 'recipt.svg', width: 115, height: 172, label: 'Saved receipt', message: 'Proof you were here. Filed under: little detours.', rotate: -16 },
  { name: 'ticket', file: 'yellowstamp.svg', width: 87, height: 126, label: 'Yellow ticket', message: 'Still admits one. Your next stop is home.', rotate: -14 },
  { name: 'key', file: 'key.svg', width: 176, height: 197, label: 'Little key', message: 'Found the key. Home is one click away.', rotate: 18 },
  { name: 'flower', file: 'flower.svg', width: 239, height: 244, label: 'Pressed flower', message: 'Picked for you. A little bright spot on a wrong turn.', rotate: -12 },
];

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={back ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The 404 stage: the maze illustration, the stickers around it, the line and the way home. */
export default function LostPageStage() {
  const [selected, setSelected] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const active = stickers.find(sticker => sticker.name === selected);

  useEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-lost-sticker]', {
          y: 10,
          rotation: -4,
          duration: 0.65,
          stagger: 0.05,
          ease: 'power3.out',
          clearProps: 'transform',
        });
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <div className={styles.stage} ref={root}>
      <div className={styles.visual}>
        <PixelMaze />
        <div className={styles.stickers}>
          {stickers.map(sticker => (
            <button
              key={sticker.name}
              type="button"
              className={`${styles.sticker} ${styles[sticker.name]}`}
              style={{ '--sticker-angle': `${sticker.rotate}deg` } as CSSProperties}
              aria-label={`${sticker.label}: reveal its saved context`}
              aria-pressed={selected === sticker.name}
              aria-controls="lost-sticker-context"
              onClick={() => setSelected(selected === sticker.name ? null : sticker.name)}
            >
              <span className={styles.art} data-lost-sticker>
                <Image src={`/svg/${encodeURIComponent(sticker.file)}`} width={sticker.width} height={sticker.height} alt="" draggable={false} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className={styles.context} id="lost-sticker-context" role="status" aria-live="polite" aria-atomic="true">
        <span className={styles.contextMark} aria-hidden="true">{active ? '↳' : '+'}</span>
        {active ? active.message : 'The little things are still here. Try a sticker.'}
      </p>

      <h1 className={styles.title}>This page slipped<br />off the shelf.</h1>

      <div className={styles.actions}>
        <Link href="/" className={styles.homeLink}><Arrow back />Back to home</Link>
        <Link href="/blog" className={styles.blogLink}>Read the blog<Arrow /></Link>
      </div>
    </div>
  );
}
