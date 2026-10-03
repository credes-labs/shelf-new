'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';

type Item = { key: string; label: string; src: string; tint: string; chips: [string, string, string] };

const ITEMS: Item[] = [
  { key: 'music', label: 'Music', src: '/svg/music.svg', tint: '#f4508a', chips: ['songs?', 'voice notes?', 'podcasts?'] },
  { key: 'image', label: 'Images', src: '/svg/image.svg', tint: '#6cc08b', chips: ['screenshots?', 'receipts?', 'memes?'] },
  { key: 'file', label: 'Files', src: '/svg/file.svg', tint: '#f5a65b', chips: ['docs?', 'imp files', 'pdf notes?'] },
  { key: 'link', label: 'Links', src: '/svg/link.svg', tint: '#4d7ce0', chips: ['articles?', 'yt videos?', 'tweets?'] },
  { key: 'notesicon', label: 'Notes', src: '/svg/notesicon.svg', tint: '#f26b6b', chips: ['ideas?', 'to-dos?', 'random thoughts?'] },
];

export default function DataTypeIcons({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const rowRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (open === null) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rowRef.current?.contains(event.target)) setOpen(null);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [open]);

  const onPointerLeave = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'touch') setOpen(null);
  };

  return (
    <ul
      ref={rowRef}
      className={`dt-row ${className}`.trim()}
      data-has-open={open !== null || undefined}
      aria-label="Things you can save to Shelf"
      onPointerLeave={onPointerLeave}
    >
      {ITEMS.map((item, index) => {
        return (
          <li key={item.key} className="dt-item" data-open={open === index || undefined} style={{ '--tint': item.tint } as CSSProperties}>
            <button
              type="button"
              className="dt-icon"
              aria-label={`${item.label}: ${item.chips.join(', ')}`}
              aria-expanded={open === index}
              onMouseEnter={() => setOpen(index)}
              onMouseLeave={() => setOpen(null)}
              onPointerDown={event => { if (event.pointerType === 'touch') setOpen(current => current === index ? null : index); }}
              onFocus={() => setOpen(index)}
              onBlur={() => setOpen(null)}
            >
              <Image src={item.src} alt="" width={34} height={36} unoptimized draggable={false} />
            </button>
            <span className="dt-chips" aria-hidden="true">
              {item.chips.map((chip, chipIndex) => <span key={chip} className="dt-chip" style={{ '--k': chipIndex } as CSSProperties}>{chip}</span>)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
