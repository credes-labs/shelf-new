'use client';

import { KeyboardEvent as ReactKeyboardEvent, PointerEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import BrickFooter from '@/components/BrickFooter';

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`brand-mark ${inverse ? 'brand-mark-inverse' : ''}`} aria-label="Shelf home"><Image className="brand-logo" src="/svg/shelf-logo.svg" alt="Shelf" width={124} height={41} unoptimized /></Link>;
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return <nav className="site-nav content-width"><Logo /><div className={`nav-links ${open ? 'nav-links-open' : ''}`}><Link href="/about" onClick={() => setOpen(false)}>About</Link><Link href="/features" onClick={() => setOpen(false)}>Features</Link><Link href="/blog" onClick={() => setOpen(false)}>Blog</Link><Link className="nav-cta" href="/#join" onClick={() => setOpen(false)}>Join waitlist</Link></div><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X size={22} /> : <Menu size={22} />}</button></nav>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-inner content-width">
      <div className="footer-brand"><Logo inverse /><div className="social-row"><Image className="social-icons-artwork" src="/svg/socials.svg" alt="Shelf social platforms" width={172} height={22} unoptimized /></div><small>© Credes Techlabs 2026</small></div>
      <div className="footer-links"><div><b>Company</b><Link href="/about">About us</Link><Link href="/#join">Contact</Link><Link href="/#join">Security</Link><Link href="/#join">Privacy Policy</Link><Link href="/#join">Terms and Conditions</Link></div><div><b>Download</b><Link href="/#join">iOS</Link><Link href="/#join">Web</Link><Link href="/#join">Mac OS</Link></div></div>
    </div>
    <BrickFooter />
  </footer>;
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
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const metrics = useRef({ top: 0, height: 0, range: 0, maxScroll: 0 });
  const drag = useRef<{ pointerY: number; trackTop: number } | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const thumb = thumbRef.current;
        const track = trackRef.current;
        if (!thumb || !track) return;
        const viewport = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const maxScroll = Math.max(0, documentHeight - viewport);
        const thumbHeight = Math.max(64, (viewport * viewport) / documentHeight);
        const trackRange = Math.max(0, viewport - thumbHeight);
        const footer = document.querySelector('.site-footer')?.getBoundingClientRect();
        const thumbTop = maxScroll ? (window.scrollY / maxScroll) * trackRange : 0;
        const intersectionTop = footer ? Math.max(0, Math.min(viewport, footer.top)) : viewport;
        const intersectionBottom = footer ? Math.max(0, Math.min(viewport, footer.bottom)) : 0;
        const touchesFooter = Boolean(footer && footer.top < viewport && footer.bottom > 0);
        let start = Math.min(100, (intersectionTop / viewport) * 100);
        let end = Math.max(start, Math.min(100, (intersectionBottom / viewport) * 100));
        const visibleSlice = thumbHeight > 0 ? (5 / thumbHeight) * 100 : 0;
        if (touchesFooter && end - start < visibleSlice) {
          if (footer && footer.top >= 0) end = Math.min(100, start + visibleSlice);
          else start = Math.max(0, end - visibleSlice);
        }
        thumb.style.display = maxScroll > 0 ? 'block' : 'none';
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translate3d(0, ${thumbTop}px, 0)`;
        thumb.style.backgroundImage = touchesFooter
          ? `linear-gradient(to bottom, var(--orange) 0%, var(--orange) ${start}%, #fff ${start}%, #fff ${end}%, var(--orange) ${end}%, var(--orange) 100%)`
          : 'none';
        track.setAttribute('aria-valuenow', `${Math.round(maxScroll ? (window.scrollY / maxScroll) * 100 : 0)}`);
        metrics.current = { top: thumbTop, height: thumbHeight, range: trackRange, maxScroll };
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
    const nextTop = Math.max(0, Math.min(metrics.current.range, event.clientY - drag.current.pointerY + drag.current.trackTop));
    document.documentElement.scrollTop = (nextTop / Math.max(1, metrics.current.range)) * metrics.current.maxScroll;
  }
  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const keyMoves: Record<string, number> = { ArrowDown: 80, ArrowUp: -80, PageDown: window.innerHeight * 0.85, PageUp: -window.innerHeight * 0.85 };
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      document.documentElement.scrollTop = event.key === 'Home' ? 0 : document.documentElement.scrollHeight;
    } else if (keyMoves[event.key]) {
      event.preventDefault();
      document.documentElement.scrollTop += keyMoves[event.key];
    }
  }
  return <div ref={trackRef} className="custom-scrollbar" role="scrollbar" aria-label="Page scroll position" aria-orientation="vertical" aria-controls="top" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} tabIndex={0} onKeyDown={handleKeyDown}>
    <div ref={thumbRef} className="custom-scrollbar-thumb" onPointerDown={(event) => { drag.current = { pointerY: event.clientY, trackTop: metrics.current.top }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={moveThumb} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} />
  </div>;
}

export function PageShell({ children }: { children: React.ReactNode }) { return <main id="top"><SiteNav /><FooterScrollTheme /><InteractiveScrollbar />{children}<Footer /></main>; }
