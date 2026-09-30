'use client';

import { useState } from 'react';
import Image from 'next/image';

const HERO_ICONS = [
  { id: 'audio', label: 'Audio', bg: '#FFE4F0', icon: '🎵' },
  { id: 'photos', label: 'Photos', bg: '#EAF8EE', icon: '🖼️' },
  { id: 'notes', label: 'Notes', bg: '#FEECEC', icon: '📝' },
  { id: 'docs', label: 'Docs', bg: '#FFF7E6', icon: '📄' },
  { id: 'links', label: 'Links', bg: '#EBF1FF', icon: '🔗' },
];

export function HeroSection() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  function scrollToWaitlist(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="hero-wrapper" aria-label="Shelf — Keep your context">

      {/* Floating alarm clock */}
      <div className="floating-clock" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="80" height="80">
          <circle cx="50" cy="54" r="36" fill="#f4f4f4" stroke="#444" strokeWidth="4" />
          <circle cx="50" cy="54" r="32" fill="#fff" />
          <ellipse cx="24" cy="22" rx="12" ry="7" transform="rotate(-30 24 22)" fill="#888" stroke="#333" strokeWidth="3" />
          <ellipse cx="76" cy="22" rx="12" ry="7" transform="rotate(30 76 22)" fill="#888" stroke="#333" strokeWidth="3" />
          <circle cx="50" cy="20" r="5" fill="#555" />
          <line x1="50" y1="54" x2="50" y2="34" stroke="#222" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="54" x2="66" y2="54" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="54" x2="38" y2="68" stroke="#da5658" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="50" cy="54" r="3" fill="#222" />
          <line x1="30" y1="86" x2="22" y2="96" stroke="#444" strokeWidth="4" strokeLinecap="round" />
          <line x1="70" y1="86" x2="78" y2="96" stroke="#444" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {/* Floating receipt */}
      <div className="floating-receipt" aria-hidden="true">
        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px 10px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          fontSize: '8px',
          fontFamily: 'monospace',
          textAlign: 'left',
          lineHeight: 1.3,
          color: '#333'
        }}>
          <div style={{ fontWeight: 'bold', textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: '4px', marginBottom: '4px' }}>
            FamilyMart
          </div>
          <div>Onigiri x2</div>
          <div>Matcha Latte</div>
          <div>Sandwich</div>
          <div style={{ borderTop: '1px dashed #ccc', marginTop: '4px', paddingTop: '4px', fontWeight: 'bold' }}>
            TOTAL ¥1,240
          </div>
        </div>
      </div>

      {/* 5 media type icons */}
      <div className="hero-mini-icons" role="list">
        {HERO_ICONS.map((icon) => (
          <div key={icon.id} style={{ position: 'relative' }} role="listitem">
            <button
              type="button"
              className="hero-mini-icon"
              style={{ backgroundColor: icon.bg }}
              onMouseEnter={() => setActiveTooltip(icon.id)}
              onMouseLeave={() => setActiveTooltip(null)}
              aria-label={icon.label}
            >
              <span style={{ fontSize: '16px' }}>{icon.icon}</span>
            </button>
            {activeTooltip === icon.id && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '12px',
                color: 'rgba(0,0,0,0.7)',
                whiteSpace: 'nowrap',
                zIndex: 20,
                pointerEvents: 'none',
              }}>
                {icon.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main headline */}
      <h1 className="hero-main-heading">
        Keep your context.<br />
        Find it when it <span className="accent-matters">matters!</span>
      </h1>

      {/* Subtitle */}
      <p className="hero-subhead">
        Shelf helps you save notes, links, screenshots, ideas, and moments into organized collections you can revisit any time
      </p>

      {/* CTA */}
      <a href="#waitlist" onClick={scrollToWaitlist} className="hero-cta-btn" id="hero-cta">
        Join waitlist!!!!
      </a>

      {/* Phone mockup (cropped at bottom) */}
      <div className="hero-phone-wrap">
        <Image
          src="/svg/phone2.svg"
          alt="Shelf on iPhone"
          width={380}
          height={760}
          className="hero-phone-img"
          priority
          unoptimized
        />
      </div>
    </section>
  );
}
