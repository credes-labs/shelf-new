'use client';

import { useState, FormEvent } from 'react';

export function BlueprintManifesto() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="blueprint-manifesto-section" id="manifesto" aria-label="Shelf manifesto">
      {/* Blueprint background grid */}
      <div className="blueprint-grid-overlay" />

      <div className="frame-wrap" style={{ position: 'relative', zIndex: 2 }}>
        <div className="manifesto-box">
          <div className="section-kicker mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span>THE ARCHIVAL MANIFESTO // 2026</span>
          </div>

          <h2 className="manifesto-quote">
            &ldquo;We don&apos;t need another ephemeral feed. We need an <span className="quote-italic">intellectual sanctuary</span> where your taste, your research, and your inspirations are preserved with the dignity of a rare book collection.&rdquo;
          </h2>

          <p className="manifesto-sub">
            The contemporary internet was optimized for infinite doomscrolling and commercial decay. Shelf restores the quiet, spatial sanctuary of personal knowledge — a place where ideas have gravity and context never dissolves.
          </p>

          {/* Access input */}
          <div style={{ maxWidth: '540px', marginTop: '32px' }}>
            {submitted ? (
              <div 
                className="mono" 
                style={{ 
                  padding: '16px 20px', 
                  background: 'rgba(255,255,255,0.12)', 
                  border: '1px solid var(--white)',
                  fontSize: '13px',
                  color: 'var(--white)'
                }}
              >
                ✓ CLEARANCE GRANTED // PRIORITY QUEUE TICKET ASSIGNED FOR {email}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="access-form">
                <input
                  type="email"
                  required
                  placeholder="ENTER WORK EMAIL FOR ARCHIVE ACCESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="access-input mono"
                />
                <button type="submit" className="access-submit mono">
                  REQUEST PASS ↗
                </button>
              </form>
            )}
            <div className="mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
              [ BATCH 01: ROLLING ADMISSIONS // NO TELEMETRY // ENCRYPTED ACCESS ]
            </div>
          </div>

          {/* 3 Pillars */}
          <div className="blueprint-pillars">
            <div className="pillar-col">
              <div className="pillar-num mono">01 // ATTENTION</div>
              <h4 className="pillar-title">Sanctuary from the Feed</h4>
              <p className="pillar-desc">
                No notifications, no engagement algorithms, no social clout metrics. Just your thoughts and the things worth keeping.
              </p>
            </div>

            <div className="pillar-col">
              <div className="pillar-num mono">02 // PERMANENCE</div>
              <h4 className="pillar-title">Immunity to the Void</h4>
              <p className="pillar-desc">
                Everything saved to Shelf is cached locally in open standards. Your intellectual vault is yours forever.
              </p>
            </div>

            <div className="pillar-col">
              <div className="pillar-num mono">03 // SPATIALITY</div>
              <h4 className="pillar-title">Cognitive Topography</h4>
              <p className="pillar-desc">
                Human memory is spatial. Shelf arranges items in dimensional rooms and shelves that align with how biological memory works.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
