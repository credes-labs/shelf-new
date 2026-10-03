'use client';

import Link from 'next/link';
import { ShelfLogo } from './shelf-logo/ShelfLogo';
import StaggeredMenu from './StaggeredMenu';
import { playUiSound } from '../lib/ui-sound';

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to the home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about Shelf', link: '/about' },
  { label: 'Features', ariaLabel: 'Explore Shelf features', link: '/features' },
  { label: 'Blogs', ariaLabel: 'Read the Shelf blog', link: '/blog' },
  { label: 'Join waitlist', ariaLabel: 'Join the waitlist', link: '#waitlist', action: 'waitlist' as const },
];

export default function SiteHeader({ className = '' }: { className?: string }) {
  return (
    <header className={`nav-wrap site-header ${className}`.trim()}>
      <Link className="brand" href="/" aria-label="Shelf home">
        <ShelfLogo className="shelf-logo" />
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/about" onClick={() => playUiSound('navigation')}>about</Link>
        <Link href="/features" onClick={() => playUiSound('navigation')}>features</Link>
        <Link href="/blog" onClick={() => playUiSound('navigation')}>blogs</Link>
      </nav>
      <StaggeredMenu
        className="site-mobile-menu"
        position="right"
        items={menuItems}
        colors={['#6972e3', '#2430bc']}
        displaySocials={false}
        displayItemNumbering
        menuButtonColor="#fff"
        openMenuButtonColor="#171717"
        accentColor="#2430bc"
      />
    </header>
  );
}
