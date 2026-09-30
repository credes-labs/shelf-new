'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Share2 } from 'lucide-react';

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
    <Image className="waitlist-card-logo" src="/svg/shelf-logo.svg" alt="Shelf" width={70} height={23} unoptimized />
    <div className="waitlist-card-art" aria-hidden="true">
      <span className="waitlist-card-phrase waitlist-card-i-got">i got</span>
      <span className="waitlist-card-phrase waitlist-card-my">my</span>
      <span className="waitlist-card-shelf">shelf</span>
      <span className="waitlist-card-phrase waitlist-card-number">number!</span>
      <span className="waitlist-card-sticker waitlist-card-sticker-one" />
      <span className="waitlist-card-sticker waitlist-card-sticker-two" />
    </div>
    <p className="waitlist-card-greeting">You’re in, {name.split(/\s+/)[0]}.</p>
    <p className="waitlist-card-id">{id}</p>
    <button className="waitlist-card-share" type="button" onClick={shareCard}>
      <Share2 size={16} strokeWidth={1.8} />
      <span>Share</span>
    </button>
    <span className="waitlist-card-share-status" aria-live="polite">{shareMessage}</span>
  </div>;
}
