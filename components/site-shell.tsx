'use client';

import { PointerEvent, useEffect, useRef, useState } from 'react';
import { Menu, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`brand-mark ${inverse ? 'brand-mark-inverse' : ''}`} aria-label="Shelf home"><img className="brand-logo" src="/svg/shelf-logo.svg" alt="Shelf" width="124" height="41" /></Link>;
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return <nav className="site-nav content-width"><Logo /><div className={`nav-links ${open ? 'nav-links-open' : ''}`}><Link href="/about" onClick={() => setOpen(false)}>About</Link><Link href="/features" onClick={() => setOpen(false)}>Features</Link><Link href="/blog" onClick={() => setOpen(false)}>Blog</Link><Link className="nav-cta" href="/#join" onClick={() => setOpen(false)}>Join waitlist</Link></div><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X size={22} /> : <Menu size={22} />}</button></nav>;
}

export function Footer() {
  return <footer className="site-footer"><div className="footer-inner content-width"><div className="footer-brand"><Logo inverse /><div className="social-row"><img className="social-icons-artwork" src="/svg/socials.svg" alt="Shelf social platforms" /></div><small>© Credes Techlabs 2026</small></div><div className="footer-links"><div><b>Company</b><Link href="/about">About us</Link><Link href="/#join">Contact</Link><Link href="/#join">Security</Link><Link href="/#join">Privacy Policy</Link><Link href="/#join">Terms and Conditions</Link></div><div><b>Download</b><Link href="/#join">iOS</Link><Link href="/#join">Web</Link><Link href="/#join">Mac OS</Link></div></div></div><div className="footer-art"><div className="arch arch-one" /><div className="arch arch-two" /><div className="arch arch-three" /><Sparkles className="footer-sparkle" size={52} /></div><div className="footer-wordmark" aria-hidden="true">shelf</div><FooterStickers /></footer>;
}

function FooterStickers() {
  const footerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const [positions, setPositions] = useState<Record<number, { left: number; top: number }>>({});
  const stickers = [
    { id: 1, text: '●‿●', className: 'sticker-smile', label: 'Drag smile sticker' },
    { id: 2, text: 'SPECIAL\n$ 2.00', className: 'sticker-ticket-footer', label: 'Drag ticket sticker' },
    { id: 3, text: '✦', className: 'sticker-flower', label: 'Drag star sticker' },
  ];
  function startDrag(event: PointerEvent<HTMLButtonElement>, id: number) {
    const parent = footerRef.current;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const itemRect = event.currentTarget.getBoundingClientRect();
    const left = itemRect.left - parentRect.left;
    const top = itemRect.top - parentRect.top;
    drag.current = { id, offsetX: event.clientX - itemRect.left, offsetY: event.clientY - itemRect.top };
    setPositions((current) => ({ ...current, [id]: current[id] ?? { left, top } }));
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current || !footerRef.current) return;
    const activeDrag = drag.current;
    const parentRect = footerRef.current.getBoundingClientRect();
    const nextPosition = {
      left: Math.max(0, Math.min(parentRect.width - 50, event.clientX - parentRect.left - activeDrag.offsetX)),
      top: Math.max(0, Math.min(parentRect.height - 50, event.clientY - parentRect.top - activeDrag.offsetY)),
    };
    setPositions((current) => ({ ...current, [activeDrag.id]: nextPosition }));
  }
  return <div ref={footerRef} className="footer-stickers" aria-label="Moveable footer stickers">{stickers.map((sticker) => {
    const position = positions[sticker.id];
    return <button key={sticker.id} type="button" className={`footer-sticker ${sticker.className} footer-sticker-draggable`} style={position ? { left: position.left, top: position.top, right: 'auto', bottom: 'auto' } : undefined} onPointerDown={(event) => startDrag(event, sticker.id)} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} aria-label={sticker.label}>{sticker.text}</button>;
  })}</div>;
}

export function FooterScrollTheme() {
  useEffect(() => {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => document.body.classList.toggle('footer-in-view', entry.isIntersecting), { threshold: 0.08 });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  return null;
}

export function InteractiveScrollbar() {
  const [metrics, setMetrics] = useState({ top: 0, height: 48, visible: false, footerVisible: false });
  const drag = useRef<{ pointerY: number; trackTop: number } | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const viewport = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const maxScroll = Math.max(0, documentHeight - viewport);
        const thumbHeight = Math.max(48, (viewport * viewport) / documentHeight);
        const trackRange = Math.max(0, viewport - thumbHeight);
        const footer = document.querySelector('.site-footer')?.getBoundingClientRect();
        setMetrics({
          top: maxScroll ? (window.scrollY / maxScroll) * trackRange : 0,
          height: thumbHeight,
          visible: maxScroll > 0,
          footerVisible: Boolean(footer && footer.top < viewport && footer.bottom > 0),
        });
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);
  function moveThumb(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const trackRange = Math.max(1, window.innerHeight - metrics.height);
    const nextTop = Math.max(0, Math.min(trackRange, event.clientY - drag.current.pointerY + drag.current.trackTop));
    const progress = nextTop / trackRange;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, progress * maxScroll);
  }
  return <div className="custom-scrollbar" aria-hidden="true">
    {metrics.visible && <div className={`custom-scrollbar-thumb ${metrics.footerVisible ? 'custom-scrollbar-thumb-footer' : ''}`} style={{ top: metrics.top, height: metrics.height }} onPointerDown={(event) => { drag.current = { pointerY: event.clientY, trackTop: metrics.top }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={moveThumb} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} />}
  </div>;
}

export function PageShell({ children }: { children: React.ReactNode }) { return <main id="top"><SiteNav /><FooterScrollTheme /><InteractiveScrollbar />{children}<Footer /></main>; }
