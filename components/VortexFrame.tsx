'use client';

import { useState } from 'react';
import Image from 'next/image';

export function VortexFrame() {
  const [isNegative, setIsNegative] = useState(true);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="vortex-frame">
      {/* Corner crosshairs */}
      <div className="vortex-corner-tl" />
      <div className="vortex-corner-tr" />
      <div className="vortex-corner-bl" />
      <div className="vortex-corner-br" />

      {/* Header telemetry */}
      <div className="vortex-header mono">
        <span>FIG. 01 — KINETIC RECURSION</span>
        <span className="pixel">ROT: -0.28 RAD</span>
        <span>LAT: 52°22&apos;N</span>
      </div>

      {/* Canvas frame */}
      <div 
        className="vortex-canvas-wrap"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsNegative((prev) => !prev)}
        title="Click to toggle optical polarity"
      >
        <Image
          src={isNegative ? '/references/footer 2.png' : '/references/footer.png'}
          alt="SHELF recursive typographic vortex"
          width={960}
          height={600}
          className="vortex-img"
          style={{ transform: `scale(${zoom})` }}
          priority
          unoptimized
        />

        {/* HUD overlay */}
        <div className="vortex-hud-overlay mono">
          <div className="vortex-hud-top">
            <span>[ SYSTEM: SHELF TESS ]</span>
            <span>POLARITY: {isNegative ? 'COBALT / WHITE' : 'WHITE / COBALT'}</span>
          </div>
          <div className="vortex-hud-bottom">
            <span>INNER WIDTH: -10PX</span>
            <span>VECTOR: CONVERGENT</span>
          </div>
        </div>
      </div>

      {/* Frame toolbar */}
      <div className="vortex-toolbar mono">
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            type="button" 
            className="vortex-btn"
            onClick={() => setIsNegative((prev) => !prev)}
          >
            {isNegative ? '● NEGATIVE (BLUE)' : '○ POSITIVE (WHITE)'}
          </button>
          <button
            type="button"
            className="vortex-btn"
            onClick={() => setZoom((z) => (z === 1 ? 1.08 : 1))}
          >
            {zoom === 1 ? 'ZOOM 1.08X' : 'RESET ZOOM'}
          </button>
        </div>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>CLICK CANVAS TO INVERT</span>
      </div>
    </div>
  );
}
