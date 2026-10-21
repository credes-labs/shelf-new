import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import LostPageStage from '../components/LostPageStage';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page not found · Shelf',
  description: 'This page slipped off the shelf. Find your way back home, or read the Shelf blog for notes on keeping your context.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#lost-page">Skip to content</a>
      <div className={styles.blue}>
        <SiteHeader className={styles.header} />
        <main id="lost-page" className={styles.main} tabIndex={-1}>
          <LostPageStage />
        </main>
        <p className={styles.footer}>A wrong turn, not a dead end.</p>
      </div>

      <aside className={styles.map} aria-label="Shelf’s archival blueprint map">
        <div className={styles.mapImage} aria-hidden="true" />
      </aside>
    </div>
  );
}
