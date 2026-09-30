'use client';

import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Link2,
  Mic,
  Music2,
  Paperclip,
  Play,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';

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
              <span className="brand-mark"><span /><span /><span /></span>
              <span>shelf</span>
            </a>
            <div className="hero-dots" aria-label="Page one of four"><span className="active" /><span /><span /><span /></div>
          </header>

          <div className="hero-grid">
            <div className="hero-art" aria-label="Shelf app preview">
              <div className="paper-note">special<br /><strong>400</strong></div>
              <div className="coin coin-one">S</div>
              <div className="coin coin-two">✦</div>
              <div className="ticket">$10.00</div>
              <div className="paper-photo"><span>✹</span></div>
              <div className="receipt">saved<br />for later<br /><span>11:48</span></div>
              <div className="phone">
                <div className="phone-screen">
                  <div className="island" />
                  <div className="phone-top"><span className="mini-logo"><span /><span /><span /></span><Bell size={17} /></div>
                  <div className="greeting"><h3>Hello Siddhant,</h3><p>What are you looking for right now?</p></div>
                  <div className="search-box"><Search size={13} /><span>Search media</span><Mic size={13} /><Send size={13} /></div>
                  <div className="quick-tools"><Paperclip /><Music2 /><ImageIcon /><Link2 /><FileText /></div>
                  <div className="phone-section"><div className="section-title"><strong>Pinned items</strong><ChevronDown size={15} /></div><div className="pin-grid">
                    <div className="video-card"><div className="cat-image"><span className="play-circle"><Play size={11} fill="currentColor" /></span></div><small>3:49</small></div>
                    <div className="note-card"><span>15 July 2025</span><strong>What was the recent<br />number to be sent?</strong><small>☑ i thought...<br />☐ buy this...</small></div>
                    <div className="pink-card"><Music2 size={18} /></div>
                  </div>
                  <div className="pin-grid lower"><div className="chat-card"><span>◉</span><small>Group preview</small></div><div className="link-card"><Link2 size={15} /><small>youtube.com</small></div></div></div>
                  <div className="phone-section second"><div className="section-title"><strong>Unvisited for weeks!</strong><ChevronDown size={15} /></div><div className="week-row"><span>♫</span><span>▣</span><span>▤</span><span>↗</span><span>☷</span></div></div>
                  <div className="phone-bottom"><Music2 /><ImageIcon /><FileText /><Link2 /><Sparkles /></div>
                </div>
              </div>
            </div>

            <div className="hero-copy">
              <h1 id="hero-title">Keep your<br />context.<br />Find it when it<br /><em>matters.</em></h1>
              <div className="waitlist-inline">
                {status === 'success' ? <div className="success-inline"><span><Check size={16} /></span><strong>You’re on the list.</strong></div> : <form onSubmit={handleSubmit}><div className="email-row"><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required /><button type="submit" disabled={status === 'loading'} aria-label="Join the waitlist">{status === 'loading' ? '...' : <ArrowRight size={18} />}</button></div>{status === 'error' && <p className="form-error">Please try again.</p>}</form>}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-reference" aria-label="Placeholder for the editorial hero image">
          <div className="hero-reference-grid" />
          <div className="hero-reference-mark">SHELF<br /><strong>ARCHIVE 001</strong></div>
          <div className="hero-reference-note">your<br />digital<br />life</div>
        </div>
      </section>
    </main>
  );
}
