import type { ReactNode } from 'react';
import BrickFooter from './BrickFooter';
import SiteHeader from './SiteHeader';

export default function ContentPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main className="site-shell content-shell">
      <div className="content-page-grid">
        <section className="content-page-main">
          <SiteHeader className="content-page-header" />
          <article className={`content-page-copy ${className}`.trim()}>{children}</article>
        </section>
        <aside className="content-page-visual" role="img" aria-label="Archival blueprint collage" />
      </div>
      <div className="mobile-footer-gap" aria-hidden="true" />
      <BrickFooter />
    </main>
  );
}
