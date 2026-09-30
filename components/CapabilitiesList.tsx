'use client';

type Capability = {
  id: string;
  tag: string;
  title: string;
  description: string;
  date: string;
  linkText: string;
};

const CAPABILITIES: Capability[] = [
  {
    id: '01',
    tag: 'CAPTURE',
    title: 'Zero-Friction Ingestion with Spatial Fidelity',
    description: 'Save full web pages, selections, screenshots, and fleeting thoughts in a single keypress without breaking your cognitive flow.',
    date: 'CORE ARCHITECTURE',
    linkText: 'SPEC 01',
  },
  {
    id: '02',
    tag: 'PERMANENCE',
    title: 'Immunity to Digital Decay and Link Rot',
    description: 'Shelf saves offline HTML & DOM snapshots. When external servers take down articles or behind paywalls, your copies remain intact.',
    date: 'COLD STORAGE',
    linkText: 'SPEC 02',
  },
  {
    id: '03',
    tag: 'TOPOGRAPHY',
    title: 'Spatial Canvas Alongside High-Density Monospace Lists',
    description: 'Switch freely between an infinite geometric mood-board canvas and a fast, searchable index for instant recall.',
    date: 'DUAL ENGINE',
    linkText: 'SPEC 03',
  },
  {
    id: '04',
    tag: 'SERENDIPITY',
    title: 'Bidirectional Neural Traces and Context Trails',
    description: 'Items remember where you found them, what you were reading alongside them, and which projects they relate to.',
    date: 'RELATIONAL GRAPH',
    linkText: 'SPEC 04',
  },
  {
    id: '05',
    tag: 'SOVEREIGNTY',
    title: 'Local-First, Zero-Telemetry, Unencumbered Storage',
    description: 'Your shelf belongs to you. Stored locally in accessible plain text and open SQLite/JSON, exportable at any millisecond.',
    date: 'OPEN PROTOCOL',
    linkText: 'SPEC 05',
  },
];

export function CapabilitiesList() {
  return (
    <section className="white-editorial-section" id="capabilities" aria-label="System capabilities">
      <div className="frame-wrap">
        {/* Section title resembling LATEST PRESS ↗ */}
        <div className="press-header-row">
          <div>
            <div className="section-kicker mono">
              <span>SYSTEM CAPABILITIES & PRINCIPLES</span>
            </div>
            <h2 className="press-main-title">
              LATEST PROTOCOLS <span className="press-arrow">↗</span>
            </h2>
          </div>
          <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
            [ 05 ACTIVE SUBSYSTEMS ]
          </div>
        </div>

        {/* List items */}
        <div className="press-list" role="list">
          {CAPABILITIES.map((cap) => (
            <div key={cap.id} className="press-row" role="listitem">
              <div className="press-brand-tag mono">
                <span>{cap.tag}</span>
              </div>

              <div className="press-headline-wrap">
                <h3>{cap.title}</h3>
                <p>{cap.description}</p>
              </div>

              <div className="press-date-source mono">
                <span>{cap.date}</span>
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
