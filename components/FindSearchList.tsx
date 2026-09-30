'use client';

import { useState } from 'react';

type SearchItem = {
  id: string;
  type: 'Note' | 'Link' | 'Audio' | 'File';
  app: string;
  title: string;
  detail: string;
};

const SHELF_SEARCH_STREAM: SearchItem[] = [
  { id: '01', type: 'Note', app: 'Notion', title: 'Japan trip checklist', detail: 'Packing, JR Pass validation, and pocket Wi-Fi pickup' },
  { id: '02', type: 'Link', app: 'Chrome', title: 'Hostel booking confirmation', detail: 'Shinjuku capsule room · Check-in 15:00' },
  { id: '03', type: 'Audio', app: 'Spotify', title: 'Shinkansen transit playlist', detail: 'Ambient electronic & synth · 2:41 runtime' },
  { id: '04', type: 'File', app: 'Files', title: 'Visa & passport PDF scan', detail: 'Verified digital copy with offline encryption' },
  { id: '05', type: 'Note', app: 'Apple Notes', title: 'Hospital & clinic visit notes', detail: 'Doctor advice, prescription receipt, insurance ID' },
  { id: '06', type: 'Link', app: 'Safari', title: 'Mt. Fuji trail topographical map', detail: 'Subashiri route elevations & mountain hut reservations' },
  { id: '07', type: 'Audio', app: 'Voice Memos', title: 'Voice memo · Osaka night market', detail: 'Recorded at Dotonbori food stall · 1:06 duration' },
  { id: '08', type: 'File', app: 'Photos', title: 'Receipt · FamilyMart iced latte', detail: 'Expense tracker tagged under #trip #coffee' },
  { id: '09', type: 'Link', app: 'Pocket', title: 'Article on Tokyo brutalist architecture', detail: 'Saved for offline reading on flight' },
  { id: '10', type: 'File', app: 'Wallet', title: 'Boarding pass · NH108 Tokyo Haneda', detail: 'Gate 114 · Seat 14A · Linked in Shelf' },
];

export function FindSearchList() {
  const [filter, setFilter] = useState<string>('All');

  const filteredItems = filter === 'All'
    ? SHELF_SEARCH_STREAM
    : SHELF_SEARCH_STREAM.filter((item) => item.type === filter);

  return (
    <section className="white-editorial-section" id="find" aria-label="Search and retrieval">
      <div className="frame-wrap">
        {/* Header matching LATEST PRESS ↗ from the mood board */}
        <div className="press-header-row">
          <div>
            <div className="section-kicker mono">
              <span>SECTION 02 // SEARCH & UNIFIED RETRIEVAL</span>
            </div>
            <h2 className="press-main-title">
              FIND ANYTHING, RIGHT WHEN IT MATTERS <span className="press-arrow">↗</span>
            </h2>
          </div>
          <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
            [ LIVE CONTEXT STREAM ]
          </div>
        </div>

        {/* Filter Cluster */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px 0', borderBottom: '1px solid var(--line-light)' }} className="mono">
          {['All', 'Note', 'Link', 'Audio', 'File'].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              style={{
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid var(--ink)',
                background: filter === category ? 'var(--ink)' : 'transparent',
                color: filter === category ? 'var(--white)' : 'var(--ink)',
                cursor: 'pointer',
                borderRadius: '2px',
                transition: 'all 0.15s ease',
              }}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>

        {/* List of items styled as the press rows */}
        <div className="press-list" role="list">
          {filteredItems.map((item) => (
            <div key={item.id} className="press-row" role="listitem">
              <div className="press-brand-tag mono">
                <span>{item.type} // {item.app}</span>
              </div>

              <div className="press-headline-wrap">
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>

              <div className="press-date-source mono">
                <span>LINKED IN SHELF</span>
              </div>

              <div className="press-arrow-icon" aria-hidden="true">
                ↗
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
