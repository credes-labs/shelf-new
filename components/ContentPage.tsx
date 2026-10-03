import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import SiteHeader from './SiteHeader';
import StickerScatter from './StickerScatter';

// Below-the-fold game: split into its own chunk, still server-rendered,
// so first paint downloads less JavaScript with identical HTML.
const BrickFooter = dynamic(() => import('./BrickFooter'));

export default function ContentPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main className="site-shell content-shell">
      <div className="content-page-grid">
        <section className="content-page-main">
          <SiteHeader className="content-page-header" />
          <article className={`content-page-copy ${className}`.trim()}>{children}</article>
          <StickerScatter />
        </section>
        <aside className="content-page-visual" role="img" aria-label="Archival blueprint collage" />
      </div>
      <div className="mobile-footer-gap" aria-hidden="true" />
      <BrickFooter />
    </main>
  );
}
