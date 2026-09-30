import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="brand-mark" aria-label="Shelf home">
      <Image className="brand-logo" src="/svg/shelf-logo.svg" alt="Shelf" width={124} height={41} unoptimized />
    </Link>
  );
}

export function SiteNav() {
  return (
    <header className="site-nav content-width">
      <Logo />
      <nav className="nav-links" aria-label="Main navigation">
        <Link href="/about">About</Link>
        <Link href="/features">Features</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/join">Join waitlist</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer content-width">
      <small>© Credes Techlabs 2026</small>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="top">
      <SiteNav />
      {children}
      <Footer />
    </main>
  );
}
