'use client';

import { useState, FormEvent } from 'react';
import { LiveToast } from './LiveToast';

export function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  }

  return (
    <>
      <LiveToast />

      <section
        className="waitlist-cta-section"
        id="waitlist"
        aria-label="Join the waitlist"
      >
        <div className="waitlist-cta-inner">
          <div className="section-pill-badge" style={{ marginBottom: '24px' }}>
            2,400+ on waitlist
          </div>

          <h2 className="section-title" style={{ marginBottom: '16px', fontSize: 'clamp(32px, 5vw, 60px)' }}>
            Save it. Find it.<br />
            <span style={{ color: 'var(--coral-accent)', fontStyle: 'italic' }}>Love it.</span>
          </h2>

          <p style={{ fontSize: '18px', color: 'rgba(0,0,0,0.6)', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
            Be first to experience Shelf on macOS and iOS.
          </p>

          {done ? (
            <div className="waitlist-success">
              <span style={{ fontSize: '28px' }}>🎉</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#111' }}>You&apos;re on the list!</div>
                <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>We&apos;ll email {email} when your spot opens.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="waitlist-form-row" id="waitlist-form">
              <input
                type="email"
                required
                placeholder="Enter your email…"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="waitlist-email-input"
                aria-label="Email address"
              />
              <button type="submit" className="hero-cta-btn" style={{ fontSize: '16px', padding: '14px 28px' }}>
                Join waitlist
              </button>
            </form>
          )}

          <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)', marginTop: '20px' }}>
            Free tier available at launch · No spam, ever.
          </p>
        </div>
      </section>
    </>
  );
}
