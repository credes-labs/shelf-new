'use client';

import { useState } from 'react';

type ArchiveItem = {
  id: string;
  category: 'Resource' | 'Article' | 'Visual' | 'Tool' | 'File';
  domain: string;
  title: string;
  creator: string;
  description: string;
  date: string;
  badge?: string;
  icon?: string;
};

const ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    id: '003',
    category: 'Resource',
    domain: 'stateofcreate.co',
    title: 'STATE OF CREATE',
    creator: 'Patreon Report',
    description: 'A comprehensive study exploring the future of creative labor, algorithmic autonomy, and the decentralization of aesthetic spaces.',
    date: 'OCT 2024',
    badge: 'REPORT',
  },
  {
    id: '004',
    category: 'Tool',
    domain: 'fontbrief.com',
    title: 'FARO DISPLAY & FONT BRIEF',
    creator: 'Galix Foundry',
    description: 'Interactive discovery engine categorizing typefaces by personality matrix, editorial weight, and optical optical contrast.',
    date: 'SEP 2024',
    badge: 'FOUNDRY',
  },
  {
    id: '005',
    category: 'Article',
    domain: 'chia.design',
    title: 'MAKING SPACE FOR A HANDMADE WEB',
    creator: 'Chia Amisola',
    description: 'Personal memory spaces, hyper-local HTML craft, and building domestic sanctuaries on an increasingly commercialized internet.',
    date: 'NOV 2024',
    badge: 'ESSAY',
  },
  {
    id: '006',
    category: 'Article',
    domain: 'anu.ink',
    title: 'MAKE SOMETHING HEAVY',
    creator: 'Anu Atluru',
    description: 'A meditation on building enduring digital artifacts with density, intentional friction, and longevity rather than ephemeral feeds.',
    date: 'AUG 2024',
    badge: 'ESSAY',
  },
  {
    id: '100',
    category: 'Resource',
    domain: 'apr-mag.com',
    title: 'APR MAG — PHYSICAL ARCHIVE',
    creator: 'APR Editorial',
    description: 'A multi-faceted platform within athletic and outdoor culture, documenting technical gear and personal archiving systems.',
    date: 'DEC 2024',
    badge: 'ARCHIVE',
  },
  {
    id: '101',
    category: 'File',
    domain: 'apple.computer',
    title: '1984 COMPUTATION & CREATIVITY',
    creator: 'Apple Archive',
    description: 'The original technical documents outlining the bicycle for the mind: direct manipulation, spatial desktop metaphors, and local privacy.',
    date: 'JAN 1984',
    badge: 'SCHEMATIC',
  },
  {
    id: '102',
    category: 'Article',
    domain: 'mielke.co',
    title: 'COMPUTERS AND CREATIVITY',
    creator: 'Molly Mielke',
    description: 'Reflections on designing creative software tools that feel like physical Japanese woodworking chisels and heavy bond stationery.',
    date: 'JUL 2024',
    badge: 'THOUGHTS',
  },
  {
    id: '103',
    category: 'Visual',
    domain: 'amberbravo.studio',
    title: 'FREE ASSOCIATION: SEVERANCE',
    creator: 'Amber Bravo',
    description: 'Visual world-building dossier analyzing corporate surrealism, mid-century control consoles, and bureaucratic brutalism.',
    date: 'OCT 2024',
    badge: 'DOSSIER',
  },
];

export function ArchiveGrid() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);

  const categories = ['All', 'Resource', 'Article', 'Visual', 'Tool', 'File'];

  const filteredItems = activeFilter === 'All'
    ? ARCHIVE_ITEMS
    : ARCHIVE_ITEMS.filter((item) => item.category === activeFilter);

  return (
    <section className="archive-section" id="archive" aria-label="Curated shelf collection">
      <div className="frame-wrap">
        {/* Section Header */}
        <div className="section-head-bar">
          <div>
            <div className="section-kicker mono">
              <span>VAULT 01 // 194 TOTAL ENTRIES</span>
            </div>
            <h2 className="section-main-title">
              STATE OF SHELF. <span className="serif" style={{ textTransform: 'none', fontWeight: 400 }}>Curated Artifacts</span>
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="filter-cluster mono" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-pill ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
                role="tab"
                aria-selected={activeFilter === cat}
              >
                {cat.toUpperCase()} {cat === 'All' ? `(${ARCHIVE_ITEMS.length})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of items */}
        <div className="archive-grid">
          {filteredItems.map((item) => (
            <article 
              key={item.id} 
              className="archive-card"
              onClick={() => setSelectedItem(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-top-row mono">
                <span className="card-index">#{item.id}</span>
                <span className="card-badge">{item.badge || item.category}</span>
              </div>

              {/* Visual preview frame */}
              <div className="card-visual-frame">
                <div className="card-visual-placeholder mono">
                  <div style={{ fontSize: '24px', opacity: 0.8, marginBottom: '6px' }}>
                    {item.category === 'Resource' && '▥'}
                    {item.category === 'Tool' && '☵'}
                    {item.category === 'Article' && '✎'}
                    {item.category === 'File' && '▤'}
                    {item.category === 'Visual' && '◈'}
                  </div>
                  <span style={{ fontSize: '10px', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)' }}>
                    ARCHIVE SNAPSHOT
                  </span>
                </div>
              </div>

              <div className="card-domain mono">{item.domain}</div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.description}</p>

              <div className="card-footer mono">
                <span>{item.creator}</span>
                <span className="card-action-link">VIEW ↗</span>
              </div>
            </article>
          ))}
        </div>

        {/* Selected Item Modal / Inspector */}
        {selectedItem && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(8, 17, 107, 0.85)',
              backdropFilter: 'blur(16px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setSelectedItem(null)}
          >
            <div 
              style={{
                background: 'var(--blue-deep)',
                border: '1px solid var(--white)',
                padding: '36px',
                maxWidth: '600px',
                width: '100%',
                position: 'relative',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', opacity: 0.7, fontSize: '11px' }}>
                <span>INDEX ENTRY #{selectedItem.id}</span>
                <button 
                  type="button" 
                  onClick={() => setSelectedItem(null)}
                  style={{ color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                >
                  [ CLOSE ✕ ]
                </button>
              </div>

              <div className="mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                {selectedItem.domain} — {selectedItem.category.toUpperCase()}
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', lineHeight: 1.1 }}>
                {selectedItem.title}
              </h2>

              <p style={{ fontSize: '14px', lineHeight: 1.7, opacity: 0.85, marginBottom: '24px' }}>
                {selectedItem.description}
              </p>

              <div className="mono" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>CURATOR: {selectedItem.creator}</span>
                <span>DATE: {selectedItem.date}</span>
                <span>STATUS: PRESERVED</span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a 
                  href={`https://${selectedItem.domain}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="nav-cta-btn"
                  style={{ padding: '10px 20px', fontSize: '12px' }}
                >
                  VISIT SOURCE ↗
                </a>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Item #${selectedItem.id} pinned to your temporary workspace.`);
                    setSelectedItem(null);
                  }}
                  style={{
                    padding: '10px 18px',
                    border: '1px solid var(--white)',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  + PIN TO SHELF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
