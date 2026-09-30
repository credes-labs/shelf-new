'use client';

import Image from 'next/image';

export function OrganizeSection() {
  return (
    <section
      className="organize-section"
      id="organize"
      aria-label="Organize features"
    >
      {/* Section badge pill */}
      <div className="section-pill-badge">Organize</div>

      <h2 className="section-title">
        Structure that adapts<br />
        to <span className="accent-your">your</span> thinking
      </h2>

      {/* 3 overlapping pastel cards */}
      <div className="cards-cluster">

        {/* Card 1: Eureka (Yellow) */}
        <div className="pastel-card card-eureka">
          <h3>Eureka</h3>
          <p className="card-subtitle">For the thought you'd otherwise<br />lose in the shower</p>

          <div className="eureka-note-box">
            <div className="eureka-note-head">
              <span>🔔 Midsem</span>
              <span style={{ fontSize: '10px', color: 'rgba(0,0,0,0.4)' }}>15 July 2026</span>
            </div>

            <div className="eureka-task-wrap">
              <div className="eureka-task-label">Holiday task 1</div>
              <div className="eureka-task-question">What was the receipt number to be sent?</div>
              <div className="eureka-check-list">
                <div className="eureka-check-item">
                  <span className="check-box-mini checked">✓</span>
                  <span>t1 (today)</span>
                </div>
                <div className="eureka-check-item">
                  <span className="check-box-mini checked">✓</span>
                  <span>buy this...</span>
                </div>
                <div className="eureka-check-item">
                  <span className="check-box-mini">○</span>
                  <span style={{ opacity: 0.6 }}>send receipt #4821</span>
                </div>
                <div className="eureka-check-item">
                  <span className="check-box-mini">○</span>
                  <span style={{ opacity: 0.6 }}>pack bags for trip</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.4)', marginTop: '8px' }}>
              Midsem text.nt
            </div>
          </div>

          {/* Orange tag sticker */}
          <div className="eureka-tag-sticker">
            <Image src="/stickers/orangetickect.svg" alt="" width={44} height={44} unoptimized />
          </div>
        </div>

        {/* Card 2: Personal context (Blue) */}
        <div className="pastel-card card-context">
          <h3>Personal context</h3>
          <p className="card-subtitle">Tied to the moment you saved it.</p>

          <div className="context-stage">
            <div className="context-photo-box">
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                📸
              </div>
            </div>

            {/* Floating tag pills */}
            <div className="context-tag-pill" style={{ top: '6px', left: '10px' }}>#note</div>
            <div className="context-tag-pill" style={{ top: '6px', right: '30px' }}>instant rec.</div>
            <div className="context-tag-pill" style={{ top: '40px', left: '50%', transform: 'translateX(-50%)' }}>linked booking</div>
            <div className="context-tag-pill" style={{ bottom: '50px', left: '8px' }}>date</div>
            <div className="context-tag-pill" style={{ bottom: '10px', right: '10px', color: '#e55' }}>#imp</div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '8px 12px' }}>
            <span style={{ fontSize: '14px' }}>▶</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#222' }}>Voice memo · Osaka</div>
              <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.5)' }}>🎵 🎵</div>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.5)' }}>3:49</span>
          </div>
        </div>

        {/* Card 3: Collections (Pink) */}
        <div className="pastel-card card-collections">
          <h3>Collections</h3>
          <p className="card-subtitle">Everything about one thing,<br />in one place</p>

          <div className="collections-stack">
            {/* Back card (rotated) */}
            <div className="collection-school-card">
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>School trip</div>
              <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.45)', marginBottom: '8px' }}>10 July 2026</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ width: '36px', height: '28px', borderRadius: '4px', background: i === 1 ? '#e8d5a0' : i === 2 ? '#a0c4e8' : '#c4e8a0', flexShrink: 0 }} />
                ))}
              </div>
            </div>

            {/* Front card */}
            <div className="collection-world-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>World building ideas</div>
                  <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.45)' }}>01 July 2026</div>
                </div>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(0,0,0,0.25)' }}>38</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ flex: 1, height: '44px', borderRadius: '6px', background: i === 1 ? '#ffd6b0' : i === 2 ? '#b0d6ff' : i === 3 ? '#ffb0d6' : '#b0ffcc', fontSize: '8px', padding: '4px', color: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ fontWeight: 700, color: '#111', marginBottom: '2px' }}>Holiday task {i}</div>
                    <div>What was...</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f5f5f5', borderRadius: '6px', padding: '6px 8px' }}>
                <span style={{ fontSize: '12px' }}>🎵</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#111' }}>Ron't.000</div>
                  <div style={{ display: 'flex', gap: '1px', marginTop: '2px' }}>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} style={{ width: '2px', height: `${4 + Math.random() * 8}px`, background: '#aaa', borderRadius: '1px' }} />
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: '9px', color: 'rgba(0,0,0,0.4)' }}>3:40</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
