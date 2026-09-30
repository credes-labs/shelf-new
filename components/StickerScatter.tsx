'use client';

import Image from 'next/image';
import { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type StickerScene = 'hero' | 'features' | 'waitlist' | 'journal' | 'editorial' | 'footer';
type StickerAction = 'drag' | 'rotate' | 'static';

type Sticker = {
  file: string;
  className: string;
  width: number;
  height: number;
  action: StickerAction;
};

const scenes: Record<StickerScene, Sticker[]> = {
  hero: [
    { file: 'pinkstamp.svg', className: 'sticker-back hero-sticker-stamp', width: 108, height: 116, action: 'drag' },
    { file: 'flower.svg', className: 'sticker-front hero-sticker-flower', width: 96, height: 124, action: 'rotate' },
    { file: 'polaroid.svg', className: 'sticker-front hero-sticker-polaroid', width: 118, height: 152, action: 'static' },
  ],
  features: [
    { file: 'stamp.svg', className: 'sticker-back features-sticker-stamp', width: 102, height: 102, action: 'rotate' },
    { file: 'smile.svg', className: 'sticker-front features-sticker-smile', width: 92, height: 100, action: 'drag' },
  ],
  waitlist: [
    { file: 'coin.svg', className: 'sticker-back waitlist-sticker-coin', width: 88, height: 88, action: 'drag' },
    { file: 'orangetickect.svg', className: 'sticker-front waitlist-sticker-ticket', width: 96, height: 96, action: 'rotate' },
  ],
  journal: [
    { file: 'polaroid.svg', className: 'sticker-front journal-sticker-polaroid', width: 78, height: 100, action: 'drag' },
  ],
  editorial: [
    { file: 'flower.svg', className: 'sticker-back editorial-sticker-flower', width: 106, height: 137, action: 'rotate' },
    { file: 'coin.svg', className: 'sticker-front editorial-sticker-coin', width: 76, height: 76, action: 'drag' },
  ],
  footer: [
    { file: 'pinkstamp.svg', className: 'sticker-front footer-sticker-boundary', width: 106, height: 114, action: 'drag' },
    { file: 'orangetickect.svg', className: 'sticker-back footer-sticker-ticket', width: 94, height: 94, action: 'static' },
    { file: 'stamp.svg', className: 'sticker-front footer-sticker-stamp', width: 100, height: 100, action: 'rotate' },
  ],
};

type Position = { x: number; y: number; angle: number };
type Start = { pointerX: number; pointerY: number; x: number; y: number };

function StickerPiece({ sticker, bump }: { sticker: Sticker; bump: () => number }) {
  const [jitter, setJitter] = useState<Position>({ x: 0, y: 0, angle: 0 });
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, angle: 0 });
  const [dragging, setDragging] = useState(false);
  const [layer, setLayer] = useState<number | undefined>();
  const start = useRef<Start | null>(null);

  useEffect(() => {
    setJitter({
      x: Math.round(Math.random() * 16 - 8),
      y: Math.round(Math.random() * 18 - 9),
      angle: Math.round(Math.random() * 12 - 6),
    });
    setLayer(sticker.className.includes('sticker-front') ? 6 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 2));
  }, [sticker.className]);

  const style = {
    '--sticker-jitter-x': `${jitter.x}px`,
    '--sticker-jitter-y': `${jitter.y}px`,
    '--sticker-jitter-angle': `${jitter.angle}deg`,
    '--sticker-drag-x': `${position.x}px`,
    '--sticker-drag-y': `${position.y}px`,
    '--sticker-manual-angle': `${position.angle}deg`,
    zIndex: dragging ? 30 : layer,
  } as CSSProperties;

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (sticker.action !== 'drag' || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = { pointerX: event.clientX, pointerY: event.clientY, x: position.x, y: position.y };
    setLayer(bump());
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const origin = start.current;
    if (!origin) return;
    setPosition((current) => ({
      ...current,
      x: origin.x + event.clientX - origin.pointerX,
      y: origin.y + event.clientY - origin.pointerY,
    }));
  }

  function onPointerUp() {
    start.current = null;
    setDragging(false);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (sticker.action !== 'drag') return;
    const step = event.shiftKey ? 24 : 10;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setPosition((current) => ({ ...current, x: current.x + move[0], y: current.y + move[1] }));
    setLayer(bump());
  }

  const actionClass = sticker.action === 'drag' ? ' sticker-draggable' : sticker.action === 'rotate' ? ' sticker-rotatable' : '';
  const className = `sticker-piece ${sticker.className}${sticker.action !== 'static' ? ` sticker-interactive${actionClass}` : ''}${dragging ? ' is-dragging' : ''}`;
  const image = <Image src={`/stickers/${sticker.file}`} alt="" width={sticker.width} height={sticker.height} unoptimized draggable={false} />;

  if (sticker.action === 'static') {
    return <span className={className} style={style} aria-hidden="true">{image}</span>;
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={sticker.action === 'drag' ? 'Move sticker' : 'Rotate sticker'}
      title={sticker.action === 'drag' ? 'Drag to move' : 'Click to rotate'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onClick={sticker.action === 'rotate' ? () => { setPosition((current) => ({ ...current, angle: current.angle + 18 })); setLayer(bump()); } : undefined}
    >
      {image}
    </button>
  );
}

export default function StickerScatter({ scene }: { scene: StickerScene }) {
  const top = useRef(12);
  return (
    <div className={`sticker-scatter sticker-scatter-${scene}`}>
      {scenes[scene].map((sticker, index) => (
        <StickerPiece key={`${scene}-${sticker.file}-${index}`} sticker={sticker} bump={() => ++top.current} />
      ))}
    </div>
  );
}
