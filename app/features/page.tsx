import { PageShell } from '@/components/site-shell';
import { OrganizeCards } from '@/components/OrganizeCards';
import { FindSearchList } from '@/components/FindSearchList';

export default function FeaturesPage() {
  return (
    <PageShell>
      <section className="editorial-page-stage" style={{ background: 'var(--blue)' }}>
        <div className="frame-wrap">
          <div className="section-kicker mono">
            <span>SHELF SYSTEM // FEATURES & CAPABILITIES</span>
          </div>

          <h1 className="editorial-h1" style={{ maxWidth: '840px' }}>
            STRUCTURE THAT ADAPTS<br />
            <span className="serif" style={{ textTransform: 'none', fontWeight: 400 }}>to your thinking.</span>
          </h1>

          <p className="editorial-lead" style={{ maxWidth: '680px' }}>
            Capture notes, links, screenshots, audio, and documents — then retrieve anything across apps with unified search.
          </p>
        </div>
      </section>

      {/* Organize Features */}
      <OrganizeCards />

      {/* Find & Search */}
      <FindSearchList />
    </PageShell>
  );
}
