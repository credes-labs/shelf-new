'use client';

export function OrganizeCards() {
  return (
    <section className="archive-section" id="organize" aria-label="Organize features">
      <div className="frame-wrap">
        {/* Section Header */}
        <div className="section-head-bar">
          <div>
            <div className="section-kicker mono">
              <span>SECTION 01 // ORGANIZE</span>
            </div>
            <h2 className="section-main-title">
              STRUCTURE THAT ADAPTS<br />
              TO <span className="serif" style={{ textTransform: 'none', fontWeight: 400 }}>your thinking.</span>
            </h2>
          </div>
          <div className="mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', maxWidth: '320px' }}>
            Flexible spaces that hold half-thoughts, voice clips, and connected research without forced filing systems.
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1: Eureka */}
          <div className="archive-card" style={{ padding: '28px', minHeight: '380px' }}>
            <div className="card-top-row mono">
              <span className="card-index">[ 01 / CAPTURE ]</span>
              <span className="card-badge">EUREKA</span>
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              Eureka
            </h3>
            <p className="card-desc" style={{ fontSize: '14px', marginBottom: '24px' }}>
              For the thought you&apos;d otherwise lose in the shower.
            </p>

            {/* Note mockup */}
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--line-blue)',
                borderRadius: '4px',
                padding: '16px',
                marginTop: 'auto',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                <span>📁 Midsem text.nt</span>
                <span>15 JULY 2026</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', marginBottom: '10px' }}>
                What was the receipt number to be sent?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399' }}>✓</span> t1 (today)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399' }}>✓</span> buy this...
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                  <span>○</span> check train timetable
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Personal Context */}
          <div className="archive-card" style={{ padding: '28px', minHeight: '380px' }}>
            <div className="card-top-row mono">
              <span className="card-index">[ 02 / METADATA ]</span>
              <span className="card-badge">CONTEXT</span>
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              Personal context
            </h3>
            <p className="card-desc" style={{ fontSize: '14px', marginBottom: '24px' }}>
              Tied to the moment you saved it.
            </p>

            {/* Floating Tags & Audio Waveform mockup */}
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--line-blue)',
                borderRadius: '4px',
                padding: '16px',
                marginTop: 'auto',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }} className="mono">
                <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', fontSize: '11px' }}>#note</span>
                <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', fontSize: '11px' }}>instant rec.</span>
                <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', fontSize: '11px' }}>linked booking</span>
                <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', fontSize: '11px' }}>date</span>
                <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', fontSize: '11px', color: '#fca5a5' }}>#imp</span>
              </div>

              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '3px',
                }}
                className="mono"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>▶</span>
                  <span style={{ fontSize: '12px' }}>VOICE MEMO // OSAKA</span>
                </div>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>3:49</span>
              </div>
            </div>
          </div>

          {/* Card 3: Collections */}
          <div className="archive-card" style={{ padding: '28px', minHeight: '380px' }}>
            <div className="card-top-row mono">
              <span className="card-index">[ 03 / SPATIAL ]</span>
              <span className="card-badge">COLLECTIONS</span>
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              Collections
            </h3>
            <p className="card-desc" style={{ fontSize: '14px', marginBottom: '24px' }}>
              Everything about one thing, in one place.
            </p>

            {/* Collections Stack mockup */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: 'auto',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid var(--line-blue)',
                  padding: '12px 14px',
                  borderRadius: '3px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>School trip</div>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>15 July 2026</div>
                </div>
                <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(0,0,0,0.25)', borderRadius: '2px' }}>
                  12 items
                </span>
              </div>

              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--line-blue-subtle)',
                  padding: '12px 14px',
                  borderRadius: '3px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>World building ideas</div>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>01 July 2026</div>
                </div>
                <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(0,0,0,0.25)', borderRadius: '2px' }}>
                  8 items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
