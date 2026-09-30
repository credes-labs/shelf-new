'use client';

import { useState } from 'react';
import Image from 'next/image';

type WaitlistCardProps = { id: string; name: string };

export default function WaitlistCard({ id, name }: WaitlistCardProps) {
  const [shareMessage, setShareMessage] = useState('');

  async function shareCard() {
    const text = `I got my Shelf waitlist number ${id}!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Shelf waitlist card', text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareMessage('Copied');
      }
    } catch {
      setShareMessage('Share cancelled');
    }
  }

  return <div className="waitlist-card" role="status" aria-label={`You're on the Shelf waitlist. Your number is ${id}.`}>
    <Image className="waitlist-card-image" src="/svg/waitlisting-card.svg" alt="" fill unoptimized />
    <span className="waitlist-card-id-cover" aria-hidden="true" />
    <span className="waitlist-card-id" aria-hidden="true">{id}</span>
    <button className="waitlist-card-share-hit-area" type="button" onClick={shareCard} aria-label="Share your Shelf waitlist card" />
    <span className="waitlist-card-share-status" aria-live="polite">{shareMessage}</span>
    <span className="sr-only">{name}, your Shelf waitlist number is {id}.</span>
  </div>;
}
