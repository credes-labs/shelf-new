'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { FileText, Image as ImageIcon, Link2, Music2, Play, Search, StickyNote } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Kind = 'polaroid' | 'receipt' | 'ticket' | 'record' | 'link' | 'sticky' | 'file';
type Tone = 'pink' | 'green' | 'orange' | 'blue' | 'coral';
type ShelfItem = {
  kind: Kind;
  tone: Tone;
  label: string;
  title: string;
  meta?: string;
  lines?: string[];
  w: number;
  h: number;
  r: number;
};
type Offset = { x: number; y: number; rotation: number };
type DragStart = { pointerX: number; pointerY: number; offset: Offset; minX: number; maxX: number; minY: number; maxY: number };

const toneIcon: Record<Tone, LucideIcon> = {
  pink: Music2,
  green: ImageIcon,
  orange: FileText,
  blue: Link2,
  coral: StickyNote,
};

const shelfItems: ShelfItem[] = [
  { kind: 'polaroid', tone: 'green', label: 'Video', title: 'osaka rooftop', meta: '0:24', w: 2, h: 4, r: -3 },
  { kind: 'receipt', tone: 'orange', label: 'Photos', title: 'FamilyMart', lines: ['Onigiri x2|¥320', 'Matcha latte|¥240', 'Total|¥1,240'], w: 1, h: 4, r: 2 },
  { kind: 'ticket', tone: 'orange', label: 'Wallet', title: 'Boarding pass', meta: 'DEL → HND', lines: ['Flight 306', 'gate 12'], w: 2, h: 1, r: 1.5 },
  { kind: 'record', tone: 'pink', label: 'Apple Music', title: 'kyoto lo-fi mix', meta: '42 min', w: 1, h: 2, r: 0 },
  { kind: 'link', tone: 'blue', label: 'Maps', title: 'Sushi Dai, Sat 7:30 pm', meta: 'maps.app/sushi-dai', w: 2, h: 1, r: -1 },
  { kind: 'sticky', tone: 'coral', label: 'Notes', title: 'hotel Wi-Fi codes', lines: ['lobby: sakura-guest', 'room 4F: 2210'], w: 1, h: 2, r: -4 },
  { kind: 'file', tone: 'orange', label: 'Notion', title: 'Visa documents.pdf', meta: '2.4 MB', w: 2, h: 2, r: 1 },
];

function LinkedDot() {
  return <em className="board-linked"><i className="linked-dot" /> linked in Shelf</em>;
}

function ItemBody({ item }: { item: ShelfItem }) {
  switch (item.kind) {
    case 'polaroid':
      return <><div className="pol-photo"><span className="pol-play"><Play size={18} fill="currentColor" /></span><span className="pol-dur">{item.meta}</span></div><p className="pol-cap">{item.title}</p></>;
    case 'receipt':
      return <div className="rc-paper"><b>{item.title}</b><small>Shibuya 2-14</small><ul>{item.lines?.map((line) => { const [name, price] = line.split('|'); return <li key={line}><span>{name}</span><span>{price}</span></li>; })}</ul><span className="rc-bar" /></div>;
    case 'ticket':
      return <><div className="tk-main"><small>{item.label}</small><b>{item.title}</b><small>{item.lines?.join(', ')}</small></div><div className="tk-stub">{item.meta}</div></>;
    case 'record':
      return <><div className="rec-disc" /><p className="rec-tag">{item.title}<small>{item.meta}</small></p></>;
    case 'link':
      return <><span className="lk-icon"><Link2 size={20} /></span><div className="lk-text"><b>{item.title}</b><small>{item.meta}</small><LinkedDot /></div></>;
    case 'sticky':
      return <><b>{item.title}</b>{item.lines?.map((line) => <p key={line}>{line}</p>)}</>;
    case 'file':
      return <><span className="fl-tab">{item.label}</span><div className="fl-body"><FileText size={28} /><div><b>{item.title}</b><small>{item.meta}</small><LinkedDot /></div></div></>;
  }
}

function BoardItem({ item, index, scene, bump }: { item: ShelfItem; index: number; scene: RefObject<HTMLDivElement | null>; bump: () => number }) {
  const Icon = toneIcon[item.tone];
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0, rotation: item.r });
  const [jitter, setJitter] = useState(0);
  const [layer, setLayer] = useState<number>();
  const [dragging, setDragging] = useState(false);
  const start = useRef<DragStart | null>(null);

  useEffect(() => {
    setJitter(Math.round(Math.random() * 4 - 2));
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === 'touch' || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const parent = scene.current;
    if (!parent) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const parentRect = parent.getBoundingClientRect();
    const cardRect = event.currentTarget.getBoundingClientRect();
    start.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offset,
      minX: parentRect.left - cardRect.left + offset.x,
      maxX: parentRect.right - cardRect.right + offset.x,
      minY: parentRect.top - cardRect.top + offset.y,
      maxY: parentRect.bottom - cardRect.bottom + offset.y,
    };
    setLayer(bump());
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const origin = start.current;
    if (!origin) return;
    const x = Math.max(origin.minX, Math.min(origin.maxX, origin.offset.x + event.clientX - origin.pointerX));
    const y = Math.max(origin.minY, Math.min(origin.maxY, origin.offset.y + event.clientY - origin.pointerY));
    setOffset((current) => ({ ...current, x, y }));
  }

  function onPointerUp() {
    start.current = null;
    setDragging(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const step = event.shiftKey ? 24 : 12;
    const movement: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    };
    if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      setOffset((current) => ({ ...current, rotation: current.rotation + (event.key === 'ArrowRight' ? 5 : -5) }));
      setLayer(bump());
      return;
    }
    if (!movement[event.key]) return;
    event.preventDefault();
    const [dx, dy] = movement[event.key];
    setOffset((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
    setLayer(bump());
  }

  const style = {
    '--w': item.w,
    '--h': item.h,
    '--r': `${offset.rotation + jitter}deg`,
    '--i': index,
    '--x': `${offset.x}px`,
    '--y': `${offset.y}px`,
    zIndex: dragging ? 30 : layer,
  } as CSSProperties;

  return (
    <article
      className={`board-item kind-${item.kind}${dragging ? ' is-dragging' : ''}`}
      data-tone={item.tone}
      style={style}
      role="group"
      aria-label={`${item.label}: ${item.title}. Drag to rearrange; use arrow keys to move and Shift with left or right to rotate.`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <ItemBody item={item} />
      <span className="board-badge" aria-hidden="true"><Icon size={15} /></span>
    </article>
  );
}

export default function ShelfCards() {
  const scene = useRef<HTMLDivElement>(null);
  const top = useRef(12);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="shelf-scene" aria-label="A scrapbook of saved items" ref={scene}>
      <div className="search-pill"><Search size={16} /> Japan tour hospital</div>
      <div className="floating-pill floating-pill-one"><Search size={14} /> Photos from Osaka</div>
      <div className={`board${seen ? ' is-in' : ''}`}>
        {shelfItems.map((item, index) => <BoardItem key={item.title} item={item} index={index} scene={scene} bump={() => ++top.current} />)}
      </div>
    </div>
  );
}
