'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { captureReferralFromUrl, type WaitlistSuccess } from '../lib/waitlist-client';
import styles from './WaitlistSignup.module.css';

type Status = 'idle' | 'loading' | 'error';

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

type ApiResult = {
  success?: boolean;
  position?: number | null;
  referralCode?: string | null;
  referralUrl?: string | null;
  alreadyJoined?: boolean;
  error?: string;
};

type Props = {
  id: string;
  source?: string;
  onSuccess: (result: WaitlistSuccess, details: { name: string; email: string }) => void;
  onCancel: () => void;
};

export default function WaitlistForm({ id, source, onSuccess, onCancel }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0].code);
  const [phone, setPhone] = useState('');
  const [notify, setNotify] = useState(false);
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const dial = COUNTRIES.find((entry) => entry.code === country)?.dial ?? '+91';

  useEffect(() => {
    captureReferralFromUrl();
    const timer = window.setTimeout(() => nameRef.current?.focus(), 320);
    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          country,
          phone: phone ? `${dial} ${phone}`.trim() : '',
          notify,
          company,
          source: source ?? (typeof window !== 'undefined' ? window.location.pathname : null),
          referrer: typeof document !== 'undefined' ? document.referrer : null,
          ref: captureReferralFromUrl(),
        }),
      });

      const result = (await response.json().catch(() => null)) as ApiResult | null;

      if (
        !response.ok ||
        !result?.success ||
        typeof result.position !== 'number' ||
        !result.referralCode ||
        !result.referralUrl
      ) {
        setError(result?.error ?? 'Something went wrong. Please check your details and try again.');
        setStatus('error');
        return;
      }

      onSuccess(
        {
          position: result.position,
          referralCode: result.referralCode,
          referralUrl: result.referralUrl,
          alreadyJoined: result.alreadyJoined === true,
        },
        { name: name.trim(), email: email.trim().toLowerCase() },
      );
    } catch {
      setError('Could not reach the waitlist. Check your connection and try again.');
      setStatus('error');
    }
  }

  return (
    <form
      id={id}
      className={styles.form}
      onSubmit={(event) => void submit(event)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onCancel();
        }
      }}
      aria-label="Join the waitlist"
    >
      <div className={styles.formTop}>
        <button className={styles.back} type="button" onClick={onCancel}>
          <span aria-hidden="true">←</span> Back
        </button>
      </div>

      <div className={styles.fields}>
        <input
          className={styles.honeypot}
          type="text"
          name="company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <label className={styles.label}>
          <span className={styles.labelText}>
            Name<span className={styles.required} aria-hidden="true">*</span>
          </span>
          <input
            ref={nameRef}
            className={styles.input}
            type="text"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            required
            minLength={1}
            maxLength={120}
            autoComplete="name"
          />
        </label>

        <label className={styles.label}>
          <span className={styles.labelText}>
            Email<span className={styles.required} aria-hidden="true">*</span>
          </span>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            maxLength={320}
            autoComplete="email"
          />
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            <span className={styles.labelText}>Country</span>
            <select
              className={styles.select}
              name="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
              {COUNTRIES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.code}&nbsp;&nbsp;{entry.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            <span className={styles.labelText}>
              Phone <span className={styles.optional}>(optional)</span>
            </span>
            <span className={styles.phoneWrap}>
              <span className={styles.dial} aria-hidden="true">{dial}</span>
              <input
                className={styles.input}
                type="tel"
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Number"
                maxLength={30}
                autoComplete="tel"
              />
            </span>
          </label>
        </div>

        <div className={styles.checks}>
          <label className={styles.check}>
            <input
              type="checkbox"
              name="notify"
              checked={notify}
              onChange={(event) => setNotify(event.target.checked)}
            />
            <span>Email me about blogs and updates</span>
          </label>
          <label className={styles.check}>
            <input type="checkbox" name="terms" required />
            <span>
              I agree to the <a href="/terms" target="_blank" rel="noreferrer">terms &amp; conditions</a>
            </span>
          </label>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button className={styles.submit} type="submit" disabled={status === 'loading'} aria-busy={status === 'loading'}>
          {status === 'loading' ? 'Saving your spot…' : 'Join waitlist'}
        </button>

        <p className={styles.formNote}>No spam. Your details stay private.</p>
      </div>
    </form>
  );
}
