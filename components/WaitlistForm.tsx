'use client';

import { FormEvent, useState } from 'react';

export default function WaitlistForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [waitlistId, setWaitlistId] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;

    let number = 2998;
    try {
      const stored = Number(window.localStorage.getItem('shelf-waitlist-next-id'));
      number = Number.isFinite(stored) && stored >= 2998 ? stored + 1 : 2998;
      window.localStorage.setItem('shelf-waitlist-next-id', String(number));
    } catch {
      number = Math.floor(1000 + Math.random() * 9000);
    }
    setWaitlistId(`#${String(number).padStart(4, '0')}`);
  }

  if (waitlistId) {
    return (
      <p className="form-confirmation" role="status">
        You&apos;re on the list, {name.trim()}. Your waitlist ID is <strong>{waitlistId}</strong>.
      </p>
    );
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit}>
      <label>
        <span>Name</span>
        <input
          autoComplete="name"
          maxLength={100}
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          required
          value={name}
        />
      </label>
      <label>
        <span>Email</span>
        <input
          autoComplete="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </label>
      <button type="submit">Join waitlist</button>
    </form>
  );
}
