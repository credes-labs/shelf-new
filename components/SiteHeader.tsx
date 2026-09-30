'use client';

import Image from 'next/image';
import Link from 'next/link';

export function SiteHeader() {
  function scrollToWaitlist(e: React.MouseEvent) {
    e.preventDefault();
    const waitlist = document.getElementById('waitlist-anchor');
    if (waitlist) {
      waitlist.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#waitlist-anchor';
    }
  }

  return (
    <header className="shelf-header">
      <Link href="/" className="brand-link" aria-label="Shelf home">
        <Image
          src="/svg/shelf-logo.svg"
          alt="shelf"
          width={112}
          height={36}
          priority
          unoptimized
        />
      </Link>

      <div className="shelf-header-right">
        <nav className="nav-text-links" aria-label="Main navigation">
          <Link href="/features" className="nav-text-link">
            Features
          </Link>
          <Link href="/blog" className="nav-text-link">
            Blog
          </Link>
        </nav>

        <a href="#waitlist-anchor" onClick={scrollToWaitlist} className="header-waitlist-btn">
          Join waitlist
        </a>
      </div>
    </header>
  );
}
