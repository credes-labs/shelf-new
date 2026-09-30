'use client';

import { useState } from 'react';
import Image from 'next/image';

const MEDIA_TAGS = [
  { id: 'audio', label: 'Audio', phrase: 'that song on loop again', color: '#F3568A', icon: '🎵' },
  { id: 'photos', label: 'Photos', phrase: 'screenshot from last night', color: '#77B79D', icon: '📸' },
  { id: 'notes', label: 'Notes', phrase: "notes you'll actually find", color: '#ED797B', icon: '📝' },
  { id: 'docs', label: 'Docs', phrase: 'the file you buried', color: '#F3B267', icon: '📄' },
  { id: 'links', label: 'Links', phrase: 'that article for later', color: '#5A76DA', icon: '🔗' },
];

export function HeroFrame() {
  const [activeMedia, setActiveMedia] = useState(MEDIA_TAGS[2]);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showVortex, setShowVortex] = useState(false);

  function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="hero-stage" aria-label="Shelf introduction">
      <div className="blueprint-watermark" aria-hidden="true" />

      <div className="frame-wrap">
        <div className="hero-grid">
          {/* Left Column: Authentic Shelf Content */}
          <div>
            {/* Telemetry pill */}
            <div className="hero-meta-row mono">
              <span className="hero-tag hero-tag-accent pixel">● SHELF 2026</span>
              <span className="hero-tag">2,400+ ON WAITLIST</span>
              <span className="hero-tag">EARLY ACCESS PROTOCOL</span>
            </div>

            {/* Media interactive switcher pill group */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'rgba(0, 0, 0, 0.22)',
                border: '1px solid var(--line-blue)',
                borderRadius: '999px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                {MEDIA_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setActiveMedia(tag)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: activeMedia.id === tag.id ? 'var(--white)' : 'transparent',
                      color: activeMedia.id === tag.id ? 'var(--blue)' : 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title={tag.phrase}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
              <span className="mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', paddingLeft: '6px', borderLeft: '1px solid var(--line-blue)' }}>
                &ldquo;{activeMedia.phrase}&rdquo;
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-title" style={{ maxWidth: '640px' }}>
              KEEP YOUR<br />
              <span className="title-italic">context.</span><br />
              FIND IT WHEN IT MATTERS!
            </h1>

            {/* Authentic Subtitle */}
            <p className="hero-statement-text">
              Shelf helps you save notes, links, screenshots, ideas, and moments into organized collections you can revisit any time.
            </p>

            {/* Waitlist Box */}
            <div className="hero-access-box">
              <div className="access-header-line mono">
                <span>[ SHELF EARLY ACCESS ]</span>
                <span>FREE TIER AVAILABLE AT LAUNCH</span>
              </div>
              {submitted ? (
                <div className="mono" style={{ fontSize: '13px', color: '#fff', padding: '8px 0' }}>
                  ✓ You&apos;re on the waitlist! Confirmation dispatched to <strong>{email}</strong>.
                </div>
              ) : (
                <form onSubmit={handleWaitlist} className="access-form">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="access-input mono"
                  />
                  <button type="submit" className="access-submit mono">
                    JOIN WAITLIST ↗
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Striking In-Frame Device & Recursive Vortex Canvas */}
          <div>
            <div className="vortex-frame">
              {/* Corner crosshairs */}
              <div className="vortex-corner-tl" />
              <div className="vortex-corner-tr" />
              <div className="vortex-corner-bl" />
              <div className="vortex-corner-br" />

              {/* Header telemetry */}
              <div className="vortex-header mono">
                <span>SHELF OS // INTERFACE FRAME</span>
                <span className="pixel">IPHONE 17 PRO // COBALT</span>
                <span>LAT: 52°22&apos;N</span>
              </div>

              {/* Viewport Frame */}
              <div 
                className="vortex-canvas-wrap" 
                style={{ 
                  height: '460px', 
                  aspectRatio: 'unset',
                  background: 'radial-gradient(circle at center, #1b269b 0%, #080c36 100%)',
                  position: 'relative'
                }}
              >
                {showVortex ? (
                  <Image
                    src="/references/footer 2.png"
                    alt="SHELF recursive typographic spiral"
                    fill
                    unoptimized
                    priority
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <Image
                      src="/svg/phone2.svg"
                      alt="Shelf on iPhone"
                      width={280}
                      height={580}
                      style={{ height: '94%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
                      priority
                      unoptimized
                    />
                  </div>
                )}

                {/* HUD Telemetry Overlay */}
                <div className="vortex-hud-overlay mono">
                  <div className="vortex-hud-top">
                    <span>{showVortex ? '[ OPTICAL VORTEX ]' : '[ SHELF MOBILE CLIENT ]'}</span>
                    <span>ACTIVE: {activeMedia.label.toUpperCase()}</span>
                  </div>
                  <div className="vortex-hud-bottom">
                    <span>SYS: LOCAL PERSISTENCE</span>
                    <span>OFFLINE DOM: READY</span>
                  </div>
                </div>
              </div>

              {/* Frame Toolbar */}
              <div className="vortex-toolbar mono">
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="vortex-btn"
                    onClick={() => setShowVortex(false)}
                    style={{ background: !showVortex ? 'var(--white)' : undefined, color: !showVortex ? 'var(--blue)' : undefined }}
                  >
                    ● APP VIEW
                  </button>
                  <button
                    type="button"
                    className="vortex-btn"
                    onClick={() => setShowVortex(true)}
                    style={{ background: showVortex ? 'var(--white)' : undefined, color: showVortex ? 'var(--blue)' : undefined }}
                  >
                    ○ SHELF VORTEX
                  </button>
                </div>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>TOGGLE PERSPECTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
