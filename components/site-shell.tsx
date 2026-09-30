'use client';

import Image from 'next/image';
import Link from 'next/link';

// ─── HEADER ─────────────────────────────────────────────────────────────────
export function SiteNav() {
  return (
    <header className="shelf-header" role="banner">
      {/* Logo */}
      <Link href="/" className="brand-link" aria-label="Shelf home">
        <Image
          src="/svg/shelf-logo.svg"
          alt="Shelf"
          width={82}
          height={28}
          priority
          unoptimized
        />
      </Link>

      <div className="shelf-header-right">
        <nav className="nav-text-links" aria-label="Main navigation">
          <Link href="/features" className="nav-text-link">Features</Link>
          <Link href="/blog" className="nav-text-link">Blog</Link>
        </nav>
        <a href="#waitlist" className="header-waitlist-btn">
          Join waitlist
        </a>
      </div>
    </header>
  );
}

// ─── FOOTER ─────────────────────────────────────────────────────────────────
const STICKERS = [
  { src: '/stickers/smile.svg', x: '4%', y: '38%', size: 72, rotate: -10 },
  { src: '/stickers/pinkstamp.svg', x: '10%', y: '55%', size: 52, rotate: 8 },
  { src: '/stickers/flower.svg', x: '17%', y: '30%', size: 58, rotate: -5 },
  { src: '/stickers/coin.svg', x: '25%', y: '50%', size: 64, rotate: 12 },
  { src: '/stickers/stamp.svg', x: '33%', y: '35%', size: 62, rotate: -15 },
  { src: '/stickers/polaroid.svg', x: '45%', y: '28%', size: 72, rotate: 6 },
  { src: '/stickers/orangetickect.svg', x: '55%', y: '50%', size: 54, rotate: -12 },
  { src: '/stickers/flower.svg', x: '63%', y: '32%', size: 60, rotate: 15 },
  { src: '/stickers/coin.svg', x: '72%', y: '48%', size: 68, rotate: -8 },
  { src: '/stickers/smile.svg', x: '80%', y: '30%', size: 56, rotate: 5 },
  { src: '/stickers/pinkstamp.svg', x: '88%', y: '52%', size: 60, rotate: -18 },
  { src: '/stickers/stamp.svg', x: '93%', y: '28%', size: 50, rotate: 10 },
];

export function Footer() {
  return (
    <footer className="shelf-orange-footer" role="contentinfo">
      {/* Top nav row */}
      <div className="footer-top-row">
        <div className="footer-brand-side">
          <Image
            src="/svg/shelf-logo.svg"
            alt="Shelf"
            width={90}
            height={30}
            className="footer-logo-white"
            unoptimized
          />
          <div className="footer-socials-row">
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            {/* X / Twitter */}
            <a href="https://x.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="X/Twitter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="LinkedIn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
            © Credes Techlabs 2026
          </div>
        </div>

        <div className="footer-columns-side">
          <div className="footer-nav-col">
            <h4>Company</h4>
            <ul>
              <li><a href="/about">About us</a></li>
              <li><a href="mailto:hello@shelf.wtf">Contact</a></li>
              <li><a href="/about">Security</a></li>
              <li><a href="/about">Privacy Policy</a></li>
              <li><a href="/about">Terms and Conditions</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Download</h4>
            <ul>
              <li><a href="#waitlist">iOS</a></li>
              <li><a href="#waitlist">Web</a></li>
              <li><a href="#waitlist">Mac os</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Big wordmark + stickers */}
      <div className="footer-wordmark-scatter-stage">
        <span className="giant-footer-shelf-text">shelf</span>
        <div className="stickers-scatter-overlay">
          {STICKERS.map((s, i) => (
            <div
              key={i}
              className="scatter-item"
              style={{
                left: s.x,
                top: s.y,
                transform: `rotate(${s.rotate}deg)`,
                zIndex: i + 1,
              }}
            >
              <Image src={s.src} alt="" width={s.size} height={s.size} unoptimized />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE SHELL ──────────────────────────────────────────────────────────────
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteNav />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
