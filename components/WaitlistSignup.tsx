'use client';

import { FormEvent, Suspense, lazy, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { playUiSound, ensureAudioUnlocked } from '../lib/ui-sound';
import WaitlistProof from './WaitlistProof';
import type { PeelDef } from './ModalPeels';
import modal from './WaitlistModal.module.css';

// Peel + drag code only downloads when the popup opens, never on page load.
const ModalPeels = lazy(() => import('./ModalPeels'));

type Status = 'idle' | 'loading' | 'success' | 'error';

// The most recently claimed external open request (menu entry). Module scope
// so every mounted instance sees it and only the first one opens its popup.
let claimedWaitlistEvent = 0;

const COUNTRIES = [
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'AE', name: 'UAE', dial: '+971' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
];

/** Peelable stickers floating on the popup (file + placement + variation). */
const PEELS: PeelDef[] = [
  { file: 'smile sticker.svg', place: 'f0', width: 102, rotate: 12, peelDirection: 0, hover: 28, active: 44 },
  { file: 'polaroid.svg', place: 'f1', width: 88, rotate: -9, peelDirection: 90, hover: 32, active: 48 },
  { file: 'red CD.svg', place: 'f2', width: 112, rotate: 16, peelDirection: 180, hover: 24, active: 40 },
  { file: 'key.svg', place: 'f3', width: 75, rotate: -18, peelDirection: 270, hover: 30, active: 46 },
  { file: 'piggybank.svg', place: 'f4', width: 95, rotate: -7, peelDirection: 90, hover: 26, active: 42 },
  { file: 'coin.svg', place: 'f5', width: 78, rotate: 14, peelDirection: 180, hover: 32, active: 50 },
  { file: 'umbrella.svg', place: 'f6', width: 90, rotate: -12, peelDirection: 0, hover: 28, active: 44 },
  { file: 'blue flower.svg', place: 'f7', width: 77, rotate: 20, peelDirection: 270, hover: 24, active: 40 },
  { file: 'wallet.svg', place: 'f8', width: 87, rotate: 8, peelDirection: 90, hover: 30, active: 46 },
  { file: 'cassete.svg', place: 'f9', width: 105, rotate: -11, peelDirection: 180, hover: 26, active: 42 },
  { file: 'matcha.svg', place: 'f10', width: 78, rotate: -16, peelDirection: 0, hover: 32, active: 48 },
  { file: 'controller.svg', place: 'f11', width: 94, rotate: 10, peelDirection: 270, hover: 28, active: 44 },
];

export default function WaitlistSignup({ id, className = '' }: { id: string; className?: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0].code);
  const [phone, setPhone] = useState('');
  const [notify, setNotify] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [joined, setJoined] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Opened from anywhere (e.g. the staggered menu entry). The first mounted
  // instance claims the event so only one popup opens.
  useEffect(() => {
    const onExternalOpen = (event: Event) => {
      const eventId = (event as CustomEvent<{ id?: number }>).detail?.id ?? 0;
      if (eventId && claimedWaitlistEvent === eventId) return;
      claimedWaitlistEvent = eventId;
      if (status === 'success' || modalOpen) return;
      playUiSound('waitlist');
      setModalOpen(true);
    };
    window.addEventListener('shelf:open-waitlist', onExternalOpen);
    return () => window.removeEventListener('shelf:open-waitlist', onExternalOpen);
  }, [status, modalOpen]);

  // Lock background scroll + close on Escape while the popup is open.
  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    // Focus the name field once the popup paints.
    const timer = window.setTimeout(() => nameRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(timer);
    };
  }, [modalOpen]);

  function openModal() {
    if (status === 'success') return;
    playUiSound('waitlist');
    setModalOpen(true);
  }

  function closeModal() {
    playUiSound('close');
    setModalOpen(false);
    if (status === 'error') setStatus('idle');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Mock mode: no requests yet. A completed form goes straight to the card.
    // Prime the audio context inside the tap gesture so the celebration plays.
    ensureAudioUnlocked();
    setStatus('loading');
    setNotice(null);
    playUiSound('click');
    window.setTimeout(() => {
      setJoined(true);
      setStatus('success');
      playUiSound('success');
      // Celebrate again as the card lands.
      window.setTimeout(() => playUiSound('success'), 450);
    }, 450);
  }

  const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? '+91';

  async function downloadCard() {
    playUiSound('click');
    try {
      const response = await fetch('/svg/waitlistingcard.svg');
      if (!response.ok) throw new Error('download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'shelf-waitlist-card.svg';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setNotice('Card downloaded.');
      playUiSound('success');
    } catch {
      setNotice('Could not download the card.');
      playUiSound('error');
    }
  }

  async function shareCard() {
    playUiSound('click');
    const firstName = name ? ` ${name.split(' ')[0]}` : '';
    const shareText = `I${firstName} just joined the Shelf waitlist — save everything, find anything.`;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    try {
      if (nav.share) {
        await nav.share({
          title: 'Shelf waitlist',
          text: shareText,
          url: window.location.origin,
        });
        setNotice('Thanks for sharing!');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
        setNotice('Invite link copied to clipboard.');
        playUiSound('success');
      } else {
        setNotice('Sharing is not available on this device.');
      }
    } catch {
      /* user dismissed the sheet — stay quiet */
    }
  }

  return (
    <div className={`waitlist-signup ${className}`.trim()}>
      {status === 'success' ? (
        <p className="waitlist-success" role="status">
          You’re on the list. Check your inbox.
        </p>
      ) : (
        <button
          className="waitlist-trigger"
          type="button"
          onClick={openModal}
          aria-haspopup="dialog"
        >
          <Image src="/svg/join%20waitlist.svg" alt="Join waitlist" width={172} height={70} unoptimized />
        </button>
      )}
      <WaitlistProof joined={joined} className="waitlist-proof" />

      {mounted && modalOpen && createPortal(
        <div className={modal.backdrop} onClick={closeModal}>
          <div
            className={modal.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            onClick={(event) => event.stopPropagation()}
          >
            <button className={modal.close} type="button" onClick={closeModal} aria-label="Close">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>

            {status === 'success' ? (
              <div className={modal.success}>
                <Image
                  className={modal.card}
                  src="/svg/waitlistingcard.svg"
                  alt="Your Shelf waitlist card"
                  width={310}
                  height={401}
                  unoptimized
                  priority
                />
                <h2 className={modal.successTitle}>
                  {name ? `You’re in, ${name.split(' ')[0]}!` : 'You’re in!'}
                </h2>
                <p className={modal.successText}>We saved your spot. Watch your inbox for early access.</p>
                <div className={modal.cardActions}>
                  <button className={modal.cardButton} type="button" onClick={() => void downloadCard()}>
                    Download card
                  </button>
                  <button className={modal.cardButton} type="button" onClick={() => void shareCard()}>
                    Share
                  </button>
                </div>
                {notice && <p className={modal.notice} role="status">{notice}</p>}
                <button className={modal.successClose} type="button" onClick={closeModal}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <Suspense fallback={null}>
                  <ModalPeels peels={PEELS} />
                </Suspense>

                <form className={modal.form} onSubmit={(event) => void submit(event)}>
                  <h2 id={`${id}-title`} className={modal.title}>
                    Join us to organize your life with <em>your AI</em>
                  </h2>

                  <div className={modal.fields}>
                    <label className={modal.label}>
                      Name<span className={modal.required} aria-hidden="true">*</span>
                      <input
                        ref={nameRef}
                        className={modal.input}
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Fill your full name"
                        required
                        autoComplete="name"
                      />
                    </label>

                    <label className={modal.label}>
                      Email<span className={modal.required} aria-hidden="true">*</span>
                      <input
                        className={modal.input}
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Fill your email address"
                        required
                        autoComplete="email"
                      />
                    </label>

                    <div className={modal.row}>
                      <label className={modal.label}>
                        Country
                        <select
                          className={modal.select}
                          value={country}
                          onChange={(event) => setCountry(event.target.value)}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code}&nbsp;&nbsp;{c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={modal.label}>
                        Phone number
                        <span className={modal.phoneWrap}>
                          <span className={modal.dial}>{dial}</span>
                          <input
                            className={modal.input}
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder="Phone number"
                            autoComplete="tel"
                          />
                        </span>
                      </label>
                    </div>

                    <div className={modal.checks}>
                      <label className={modal.check}>
                        <input
                          type="checkbox"
                          checked={notify}
                          onChange={(event) => setNotify(event.target.checked)}
                        />
                        Agree to email notifications about blogs and updates
                      </label>
                      <label className={modal.check}>
                        <input type="checkbox" required />
                        T&C read
                      </label>
                    </div>

                    {status === 'error' && (
                      <p className={modal.error} role="alert">
                        Something went wrong. Please check your details and try again.
                      </p>
                    )}

                    <button className={modal.submit} type="submit" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Joining…' : 'Join waitlist!!!!'}
                    </button>

                    <WaitlistProof fetchCount={false} joined={joined} tone="dark" size={34} className={modal.proof} />
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
