import { PageShell } from '@/components/site-shell';

export default function AboutPage() {
  return (
    <PageShell>
      <section className="editorial-page-stage" style={{ background: 'var(--blue)' }}>
        <div className="page-container-narrow">
          <div className="section-kicker mono">
            <span>ABOUT SHELF // CONTEXT THAT MATTERS</span>
          </div>

          <h1 className="editorial-h1">
            KEEP YOUR CONTEXT.<br />
            <span className="serif" style={{ textTransform: 'none', fontWeight: 400 }}>Find it when it matters.</span>
          </h1>

          <p className="editorial-lead">
            Shelf helps you save notes, links, screenshots, ideas, and moments into organized collections you can revisit any time.
          </p>

          <div className="editorial-body-prose">
            <p>
              Most tools ask you to file things away into rigid folder taxonomies and hope you remember where they went. Shelf starts with a much simpler premise: save freely, and surface the right context when you actually need it.
            </p>
            <p>
              Whether it&apos;s a voice note recorded at midnight, a screenshot of a design detail, an article saved for later, or a ticket for an upcoming trip — Shelf unites notes, links, audio, and files in one fluid spatial system.
            </p>
            <p>
              Structure adapts to your thinking, not the other way around. Designed with care for macOS and iOS.
            </p>
          </div>

          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--line-blue)' }}>
            <div className="mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
              CREDES TECHLABS © 2026 // PRODUCT IDENTITY
            </div>
            <a href="/#waitlist" className="nav-cta-btn">
              JOIN THE WAITLIST ↗
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
