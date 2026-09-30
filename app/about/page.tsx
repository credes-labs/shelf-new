import { PageShell } from '@/components/site-shell';

export default function AboutPage() {
  return (
    <PageShell>
      <article className="simple-page content-width">
        <p className="eyebrow">About Shelf</p>
        <h1>Context that stays with you.</h1>
        <p>Shelf is for the half-finished thoughts, saved tabs, screenshots, and quiet ideas you don&apos;t want to lose — organized the way you actually think.</p>
        <p>Most tools ask you to file things away and hope you remember where they went. Shelf starts with a simpler idea: save freely, then find what matters when you need it.</p>
        <p>Notes, links, photos, files, and fleeting moments can live together. The structure adapts to how you think, not the other way around.</p>
      </article>
    </PageShell>
  );
}
