'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './WaitlistProof.module.css';

export type Person = { name: string; src?: string };

// Illustrative Unsplash portraits. Replace these with opt-in member portraits if desired.
const DEFAULT_PEOPLE: Person[] = [
  { name: 'Illustrative stock portrait', src: '/images/waitlist/portrait-1.jpg' },
  { name: 'Illustrative stock portrait', src: '/images/waitlist/portrait-2.jpg' },
  { name: 'Illustrative stock portrait', src: '/images/waitlist/portrait-3.jpg' },
  { name: 'Illustrative stock portrait', src: '/images/waitlist/portrait-4.jpg' },
  { name: 'Illustrative stock portrait', src: '/images/waitlist/portrait-5.jpg' },
  { name: 'Illustrative stock portrait', src: '/images/waitlist/portrait-6.jpg' },
];
const YOU: Person = { name: "You're in" };
const TINTS = ['#ffd6e8', '#cfe8ff', '#d9f7c8', '#ffe9a8', '#e2d6ff', '#ffd9c2'];

// Shared across every proof instance (desktop + mobile + modal mount together):
// one request per minute no matter how many counters are on screen.
let sharedCount: { value: number; at: number } | null = null;
let inflightCount: Promise<number | null> | null = null;
const COUNT_TTL = 60_000;

function loadCount(): Promise<number | null> {
  if (sharedCount && Date.now() - sharedCount.at < COUNT_TTL) {
    return Promise.resolve(sharedCount.value);
  }
  if (!inflightCount) {
    inflightCount = fetch('/api/waitlist', { cache: 'no-store' })
      .then((response) => (response.ok ? (response.json() as Promise<{ count?: number | null }>) : null))
      .then((result) => {
        const value = typeof result?.count === 'number' ? result.count : null;
        if (value !== null) sharedCount = { value, at: Date.now() };
        return value;
      })
      .catch(() => null)
      .finally(() => {
        inflightCount = null;
      });
  }
  return inflightCount;
}

function useTween(initial: number) {
  const [value, setValue] = useState(initial);
  const current = useRef(initial);
  const raf = useRef(0);

  const set = useCallback((next: number) => {
    cancelAnimationFrame(raf.current);
    current.current = next;
    setValue(next);
  }, []);

  const to = useCallback((target: number, duration: number) => {
    cancelAnimationFrame(raf.current);
    const from = current.current;
    if (duration <= 0 || from === target) return set(target);
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const next = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)));
      current.current = next;
      setValue(next);
      if (t < 1) raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
  }, [set]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { value, set, to };
}

function Face({ person }: { person: Person }) {
  const [failed, setFailed] = useState(false);
  if (!person.src || failed) {
    const tint = TINTS[person.name.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0) % TINTS.length];
    return <span className={styles.initial} style={{ background: tint }}>{person.name[0]}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={styles.photo} src={person.src} alt="" draggable={false} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

type Props = {
  people?: Person[];
  /** Exact count from the waitlist API. Omit it to fetch the current count. */
  count?: number;
  /** Shows the joining user's avatar after a successful signup. */
  joined?: boolean;
  /** Set false to skip the count request entirely (mock mode). */
  fetchCount?: boolean;
  tone?: 'light' | 'dark';
  size?: number;
  className?: string;
};

export default function WaitlistProof({ people = DEFAULT_PEOPLE, count, joined = false, fetchCount = true, tone = 'dark', size = 30, className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gate = useRef<'idle' | 'armed' | 'in'>('idle');
  const [fetchedCount, setFetchedCount] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'armed' | 'in'>('idle');
  const actualCount = typeof count === 'number' ? count : fetchedCount;
  const actualCountRef = useRef(actualCount);
  actualCountRef.current = actualCount;
  const peopleList = joined ? [...people, YOU] : people;
  const { value, set: setValue, to: tweenTo } = useTween(0);

  useEffect(() => {
    if (typeof count === 'number' || !fetchCount) {
      if (typeof count === 'number') setFetchedCount(count);
      return;
    }
    let cancelled = false;
    loadCount().then((value) => {
      if (!cancelled && value !== null) setFetchedCount(value);
    });
    return () => {
      cancelled = true;
    };
  }, [count, fetchCount]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gate.current = 'armed';
    setPhase('armed');
    setValue(0);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gate.current = 'in';
      setPhase('in');
      if (actualCountRef.current !== null) tweenTo(actualCountRef.current, 1400);
      observer.disconnect();
    }, { threshold: 0.6 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [setValue, tweenTo]);

  useEffect(() => {
    if (actualCount === null || gate.current === 'armed') return;
    tweenTo(actualCount, gate.current === 'in' ? 600 : 0);
  }, [actualCount, tweenTo]);

  useEffect(() => {
    if (active === null) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setActive(null);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [active]);

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(' ')} data-tone={tone} data-phase={phase} style={{ '--size': `${size}px` } as CSSProperties}>
      <ul className={styles.stack} aria-label="Illustrative stock portraits" onPointerLeave={event => { if (event.pointerType !== 'touch') setActive(null); }}>
        {peopleList.map((person, index) => {
          const distance = active === null ? null : index - active;
          const shift = distance === null || distance === 0 ? 0 : Math.sign(distance) * Math.max(3, 11 - Math.abs(distance) * 3);
          const isYou = person === YOU;
          return (
            <li key={isYou ? 'you' : `${person.name}-${index}`} className={styles.item} data-active={distance === 0 || undefined} data-you={isYou || undefined} style={{ '--i': index, '--shift': `${shift}px`, '--s': distance === 0 ? 1.2 : distance === 1 || distance === -1 ? 1.06 : 1, '--y': distance === 0 ? '-3px' : '0px' } as CSSProperties}>
                <button type="button" className={styles.avatar} aria-label={person.name} onPointerEnter={event => { if (event.pointerType !== 'touch') setActive(index); }} onPointerDown={event => { if (event.pointerType === 'touch') setActive(current => current === index ? null : index); }} onFocus={() => setActive(index)} onBlur={() => setActive(null)}>
                  {isYou ? <span className={styles.you}><svg viewBox="0 0 24 24" width="55%" height="55%" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span> : <Face person={person} />}
                </button>
            </li>
          );
        })}
      </ul>
      <p className={styles.label}>
        {actualCount === null ? <span>Join the early access list</span> : <>
          <span className={styles.sr}>{actualCount.toLocaleString()} people already joined</span>
          <span aria-hidden="true"><span className={styles.count}>+{value.toLocaleString()}</span> people already joined</span>
        </>}
      </p>
    </div>
  );
}
