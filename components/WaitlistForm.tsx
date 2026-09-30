'use client';

import { FormEvent, useState } from 'react';

export default function WaitlistForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;

    let number = 1421;
    try {
      const stored = Number(window.localStorage.getItem('shelf-waitlist-next-id'));
      number = Number.isFinite(stored) && stored >= 1421 ? stored + 1 : 1421;
      window.localStorage.setItem('shelf-waitlist-next-id', String(number));
    } catch {
      number = Math.floor(1420 + Math.random() * 500);
    }
    setTicketId(`SHF-ARC-${String(number).padStart(5, '0')}`);
  }

  if (ticketId) {
    return (
      <div 
        className="mono" 
        style={{ 
          padding: '24px', 
          background: 'rgba(255, 255, 255, 0.12)', 
          border: '1px solid var(--white)',
          borderRadius: '2px',
          marginTop: '20px'
        }}
        role="status"
      >
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
          ✓ ACCESSION RECORD CONFIRMED
        </div>
        <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
          CLEARANCE CODE: {ticketId}
        </div>
        <p style={{ fontSize: '13px', opacity: 0.85 }}>
          Welcome, {name.trim()}. You are indexed in the primary cohort. Watch your inbox at <strong>{email.trim()}</strong> for activation credentials.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
      <label className="mono" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
        <span>[01] FULL NAME / IDENTIFIER</span>
        <input
          autoComplete="name"
          maxLength={100}
          name="name"
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Elena Rostova"
          required
          value={name}
          className="access-input mono"
        />
      </label>

      <label className="mono" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
        <span>[02] TRANSMISSION ADDRESS (EMAIL)</span>
        <input
          autoComplete="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@institution.org"
          required
          type="email"
          value={email}
          className="access-input mono"
        />
      </label>

      <button 
        type="submit" 
        className="access-submit mono" 
        style={{ padding: '14px 24px', marginTop: '12px', fontSize: '13px', alignSelf: 'flex-start' }}
      >
        TRANSMIT REQUEST & CLAIM CLEARANCE ↗
      </button>
    </form>
  );
}
