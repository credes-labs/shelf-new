'use client';

import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  Check,
} from 'lucide-react';
import BrickFooter from '../components/BrickFooter';
import HeadlineStyleToken from '../components/HeadlineStyleToken';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Unable to join');
      setEmail('');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="site-shell">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-blue">
          <header className="nav-wrap">
            <a className="brand" href="#top" aria-label="Shelf home">
              <img src="/svg/shelf%20logo.svg" width="124" height="41" alt="" />
            </a>
            <div className="hero-dots" aria-label="Page one of four"><span className="active" /><span /><span /><span /></div>
          </header>

          <div className="hero-grid">
            <div className="hero-art" aria-label="Shelf app preview">
              <img className="sticker sticker-spider behind" src="/svg/spider.svg" alt="" draggable="false" />
              <img className="sticker sticker-alarm behind" src="/svg/alarm%20clock.svg" alt="" draggable="false" />
              <img className="sticker sticker-coin behind" src="/svg/coin.svg" alt="" draggable="false" />
              <div className="phone"><img className="phone-svg" src="/svg/iphone%20screen%201.svg" alt="Shelf app displayed on an iPhone" /></div>
              <img className="sticker sticker-special over" src="/svg/yellowstamp.svg" alt="" draggable="false" />
              <img className="sticker sticker-polaroid over" src="/svg/polaroid.svg" alt="" draggable="false" />
              <img className="sticker sticker-receipt over" src="/svg/recipt.svg" alt="" draggable="false" />
              <img className="sticker sticker-smile over" src="/svg/smile%20sticker.svg" alt="" draggable="false" />
              <img className="sticker sticker-flower over" src="/svg/flower.svg" alt="" draggable="false" />
              <img className="sticker sticker-pink over" src="/svg/pinkstamp.svg" alt="" draggable="false" />
              <img className="sticker sticker-yellow over" src="/svg/yellowstamp.svg" alt="" draggable="false" />
            </div>

            <div className="hero-copy">
              <h1 id="hero-title">Keep your<br />context.<br />Find it when it<br /><HeadlineStyleToken /></h1>
              <div className="waitlist-inline">
                {status === 'success' ? <div className="success-inline"><span><Check size={16} /></span><strong>You’re on the list.</strong></div> : <form onSubmit={handleSubmit}><div className="email-row"><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required /><button type="submit" disabled={status === 'loading'} aria-label="Join the waitlist">{status === 'loading' ? '...' : <ArrowRight size={18} />}</button></div>{status === 'error' && <p className="form-error">Please try again.</p>}</form>}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-reference" role="img" aria-label="Archival blueprint collage" />
      </section>
      <BrickFooter />
    </main>
  );
}
