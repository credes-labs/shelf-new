import { PageShell } from '@/components/site-shell';
import WaitlistForm from '@/components/WaitlistForm';

export default function JoinPage() {
  return (
    <PageShell>
      <section className="editorial-page-stage" style={{ background: 'var(--blue)' }}>
        <div className="page-container-narrow">
          <div className="section-kicker mono">
            <span>EARLY ACCESS // CLEARANCE QUEUE</span>
          </div>

          <h1 className="editorial-h1">
            REQUEST ADMISSION TO <span className="serif" style={{ textTransform: 'none', fontWeight: 400 }}>the vault.</span>
          </h1>

          <p className="editorial-lead">
            Shelf is opening admissions in controlled archival cohorts to preserve community density and guarantee end-to-end sync integrity.
          </p>

          <div 
            style={{ 
              background: 'rgba(0, 0, 0, 0.25)', 
              border: '1px solid var(--line-blue)', 
              padding: '36px',
              borderRadius: '2px',
              marginTop: '32px'
            }}
          >
            <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.6, borderBottom: '1px solid var(--line-blue-subtle)', paddingBottom: '12px' }}>
              <span>COHORT: ALPHA-01</span>
              <span>SLOTS: LIMITED ADMISSIONS</span>
            </div>
            <WaitlistForm />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
