'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { playUiSound } from '../lib/ui-sound';
import WaitlistProof from './WaitlistProof';
import modal from './WaitlistModal.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

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

/** Sticker collage for the popup (file + position class). */
const COLLAGE: { file: string; className: string }[] = [
  { file: 'pinkstamp.svg', className: 's0' },
  { file: 'smile sticker.svg', className: 's1' },
  { file: 'yellowstamp.svg', className: 's2' },
  { file: 'piggybank.svg', className: 's3' },
  { file: 'coin.svg', className: 's4' },
  { file: 'key.svg', className: 's5' },
  { file: 'polaroid.svg', className: 's6' },
  { file: 'umbrella.svg', className: 's7' },
  { file: 'blue flower.svg', className: 's8' },
  { file: 'cassete.svg', className: 's9' },
  { file: 'calculator.svg', className: 's10' },
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
  const [count, setCount] = useState<number | undefined>();
  const [joined, setJoined] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

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
    setStatus('loading');
    playUiSound('click');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, country, phone, notify }),
      });
      if (!response.ok) throw new Error('Unable to join');
      const result = (await response.json()) as { count?: number | null };
      if (typeof result.count === 'number') setCount(result.count);
      setJoined(true);
      setStatus('success');
      playUiSound('success');
      // Celebrate again as the card lands.
      window.setTimeout(() => playUiSound('success'), 450);
    } catch {
      setStatus('error');
      playUiSound('error');
    }
  }

  const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? '+91';

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
      <WaitlistProof count={count} joined={joined} className="waitlist-proof" />

      {mounted && modalOpen && createPortal(
        <div className={modal.backdrop} onClick={closeModal}>
          <div
            className={modal.panel}
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
                <button className={modal.successClose} type="button" onClick={closeModal}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className={modal.collage} aria-hidden="true">
                  {COLLAGE.map((sticker, index) => (
                    <img
                      key={sticker.file}
                      className={`${modal.sticker} ${modal[sticker.className]}`}
                      style={{ '--d': `${index * 55}ms` } as React.CSSProperties}
                      src={`/svg/${encodeURIComponent(sticker.file)}`}
                      alt=""
                      draggable="false"
                    />
                  ))}
                  <span className={`${modal.bubble} ${modal.b0}`}>Stop wasting time</span>
                  <span className={`${modal.bubble} ${modal.b1}`}>Deal of the pile</span>
                </div>

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

                    <WaitlistProof count={count} joined={joined} tone="light" size={34} className={modal.proof} />
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
