'use client';

import { useState } from 'react';

const tabs = [
  { label: 'Audio', x: 0, width: 36 },
  { label: 'Photos', x: 61, width: 40 },
  { label: 'Notes', x: 127, width: 39 },
  { label: 'Files', x: 191, width: 43 },
  { label: 'Links', x: 255, width: 44 },
];

export default function HeroTabs() {
  const [activeTab, setActiveTab] = useState<number | null>(null);

  return <div className="hero-tabs" role="group" aria-label="Things you can save in Shelf">
    {tabs.map((tab, index) => <button
      key={tab.label}
      className={`hero-tab-hit-area${activeTab === index ? ' is-active' : ''}`}
      type="button"
      aria-label={`${tab.label} can be saved in Shelf`}
      aria-pressed={activeTab === index}
      title={tab.label}
      style={{
        left: `${tab.x / 299 * 100}%`,
        width: `${tab.width / 299 * 100}%`,
      }}
      onClick={() => setActiveTab(activeTab === index ? null : index)}
    >
      <span aria-hidden="true" style={{ left: `${-tab.x / 299 * 100}cqw` }} />
    </button>)}
  </div>;
}
