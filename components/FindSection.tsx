'use client';

import { useState } from 'react';
import Image from 'next/image';

const SHELF_ITEMS = [
  { id: '01', type: 'FILE', app: 'PHOTOS', title: 'receipt · FamilyMart', color: '#ffe8d6' },
  { id: '02', type: 'NOTE', app: 'NOTION', title: 'souvenir shop list', color: '#d6f0ff' },
  { id: '03', type: 'LINK', app: 'POCKET', title: 'article for later', color: '#d6ffe8' },
  { id: '04', type: 'AUDIO', app: 'APPLE MUSIC', title: 'shinkansen playlist', color: '#ffd6f0' },
  { id: '05', type: 'FILE', app: 'WALLET', title: 'boarding pass', color: '#fff3d6' },
  { id: '06', type: 'NOTE', app: 'NOTES', title: 'restaurant reservation', color: '#e8d6ff' },
  { id: '07', type: 'LINK', app: 'MAPS', title: 'hotel Wi-Fi codes', color: '#d6f0ff' },
  { id: '08', type: 'NOTE', app: 'NOTION', title: 'Japan trip checklist', color: '#d6ffe8' },
  { id: '09', type: 'LINK', app: 'CHROME', title: 'hostel booking link', color: '#ffe8d6' },
];

const TYPE_COLORS: Record<string, string> = {
  FILE: '#F3B267',
  NOTE: '#77B79D',
  LINK: '#5A76DA',
  AUDIO: '#F3568A',
};

export function FindSection() {
  const [query, setQuery] = useState('');

  return (
    <section
      className="find-stage"
      id="find"
      aria-label="Find anything"
    >
      {/* Section badge pill */}
      <div className="section-pill-badge">Find</div>

      <h2 className="section-title" style={{ marginBottom: '40px' }}>
        Find anything, right<br />when it matters
      </h2>

      {/* Search bar */}
      <div className="search-bar-wrap">
        <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: '18px' }}>🔍</span>
        <input
          type="text"
          className="search-input-field"
          placeholder="Search notes, photos, links…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search your shelf"
        />
        <span className="search-mic-icon" aria-hidden="true">🎤</span>
        <button type="button" className="search-submit-btn" aria-label="Search">
          →
        </button>
      </div>

      {/* Physical shelf + standing cards */}
      <div className="physical-shelf-container">
        <div className="shelf-cards-row">
          {SHELF_ITEMS.map((item) => (
            <div key={item.id} className="standing-card" style={{ background: item.color }}>
              <span
                className="standing-badge"
                style={{
                  background: TYPE_COLORS[item.type] + '33',
                  color: TYPE_COLORS[item.type],
                }}
              >
                {item.type}
              </span>
              <div className="standing-title">{item.title}</div>
              <div className="standing-meta">{item.app}</div>
              <div className="standing-meta" style={{ marginTop: '6px', fontSize: '8px', color: '#5A76DA' }}>
                ● linked in Shelf
              </div>
            </div>
          ))}
        </div>

        {/* Wooden shelf bar */}
        <div className="wooden-shelf-bar" />

        {/* Sticker floating right */}
        <div style={{ position: 'absolute', right: '-20px', top: '10px', opacity: 0.9, transform: 'rotate(12deg)' }}>
          <Image src="/stickers/coin.svg" alt="" width={56} height={56} unoptimized />
        </div>

        {/* Sticker floating left */}
        <div style={{ position: 'absolute', left: '-16px', top: '20px', opacity: 0.9, transform: 'rotate(-8deg)' }}>
          <Image src="/stickers/stamp.svg" alt="" width={48} height={48} unoptimized />
        </div>
      </div>
    </section>
  );
}
