'use client';

import { FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
} from 'lucide-react';
import BrickFooter from '../components/BrickFooter';
import HeadlineStyleToken from '../components/HeadlineStyleToken';

type HeroSticker = { file: string; name: string };
type StickerScene = { behind: HeroSticker[]; front: HeroSticker[] };

const stickerScenes: StickerScene[] = [
  {
    behind: [{ file: 'spider.svg', name: 'spider' }, { file: 'alarm clock.svg', name: 'alarm' }, { file: 'coin.svg', name: 'coin' }],
    front: [
      { file: 'yellowstamp.svg', name: 'special' }, { file: 'polaroid.svg', name: 'polaroid' },
      { file: 'recipt.svg', name: 'receipt' }, { file: 'smile sticker.svg', name: 'smile' },
      { file: 'flower.svg', name: 'flower' }, { file: 'pinkstamp.svg', name: 'pink' },
      { file: 'yellowstamp.svg', name: 'yellow' },
    ],
  },
  {
    behind: [{ file: 'blude CD.svg', name: 'cd-blue' }, { file: 'ipod.svg', name: 'ipod' }, { file: 'notes.svg', name: 'notes' }, { file: 'key.svg', name: 'key' }],
    front: [
      { file: 'red CD.svg', name: 'cd-red' }, { file: 'cassete.svg', name: 'cassette' },
      { file: 'calculator.svg', name: 'calculator' }, { file: 'controller.svg', name: 'controller' },
      { file: 'clothes.svg', name: 'clothes' }, { file: 'blue flower.svg', name: 'blue-flower' },
    ],
  },
  {
    behind: [{ file: 'yellow CD.svg', name: 'cd-yellow' }, { file: 'wallet.svg', name: 'wallet' }, { file: 'matcha.svg', name: 'matcha' }, { file: 'umbrella.svg', name: 'umbrella' }],
    front: [
      { file: 'piggybank.svg', name: 'piggybank' }, { file: 'notepad.svg', name: 'notepad' },
      { file: 'controller.svg', name: 'controller' }, { file: 'polaroid.svg', name: 'polaroid' },
      { file: 'pinkstamp.svg', name: 'pink' }, { file: 'blue flower.svg', name: 'blue-flower' },
    ],
  },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundStep = useRef(0);

  useEffect(() => {
    const unlockAudio = () => {
      try {
        audioRef.current ??= new window.AudioContext();
        if (audioRef.current.state === 'suspended') void audioRef.current.resume();
      } catch { /* Audio is an enhancement; scrolling still works without it. */ }
    };
    const playDialClick = () => {
      const context = audioRef.current;
      if (!context || context.state !== 'running') return;
      const start = context.currentTime;
      [0, 0.042].forEach((delay, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(index === 0 ? 1750 : 1180, start + delay);
        oscillator.frequency.exponentialRampToValueAtTime(index === 0 ? 920 : 720, start + delay + 0.026);
        gain.gain.setValueAtTime(0.0001, start + delay);
        gain.gain.exponentialRampToValueAtTime(0.025, start + delay + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + delay + 0.032);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start + delay);
        oscillator.stop(start + delay + 0.035);
      });
    };
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const section = heroRef.current;
        if (!section) {
          setScrollProgress(0);
          soundStep.current = 0;
          return;
        }
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        const distance = Math.max(1, rect.height - viewportHeight);
        const next = Math.max(0, Math.min(2, (-rect.top / distance) * 2));
        setScrollProgress(value => Math.abs(value - next) > 0.004 ? next : value);
        const nextStep = Math.floor(next * 8 + 0.001);
        if (nextStep !== soundStep.current) {
          soundStep.current = nextStep;
          playDialClick();
        }
      });
    };
    window.addEventListener('wheel', unlockAudio, { passive: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('wheel', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (frame) window.cancelAnimationFrame(frame);
      if (audioRef.current) void audioRef.current.close();
    };
  }, []);

  const screenImages = ['/svg/iphone%20screen%201.svg', '/svg/iphone%20screen%202.svg', '/svg/iphone%20screen%203.svg'];
  const transition = scrollProgress - Math.floor(scrollProgress);
  const easedTransition = transition * transition * (3 - 2 * transition);
  const weights = screenImages.map((_, index) => {
    const from = Math.min(2, Math.floor(scrollProgress));
    if (index === from) return 1 - easedTransition;
    if (index === from + 1) return easedTransition;
    return index === 2 && scrollProgress >= 2 ? 1 : 0;
  });
  const activeHeadline = Math.min(2, Math.round(scrollProgress));
  const activeDot = Math.min(3, Math.round(scrollProgress * 1.5));
  const dotColors = ['#ffffff', '#ffdb3a', '#ff8f70', '#9ce0ff'];
  const scrollToDot = (index: number) => {
    if (!heroRef.current) return;
    const section = heroRef.current;
    const range = section.offsetHeight - (window.visualViewport?.height ?? window.innerHeight);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + range * (index / 3), behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const stickerLayerStyle = (index: number): React.CSSProperties => {
    return { opacity: 1, transform: `translate3d(0, ${(index - scrollProgress) * 100}vh, 0)` };
  };

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
      <section ref={heroRef} className="hero" id="top" aria-label="Shelf app introduction">
        <div className="hero-stage">
        <div className="hero-blue">
          <header className="nav-wrap">
            <a className="brand" href="#top" aria-label="Shelf home">
              <img src="/svg/shelf%20logo.svg" width="124" height="41" alt="" />
            </a>
            <div className="hero-dots" aria-label="Hero sections">
              {[0, 1, 2, 3].map((index) => <button key={index} type="button" aria-label={`Go to hero section ${index + 1}`} aria-pressed={activeDot === index} className={activeDot === index ? 'active' : ''} style={{ '--dot-color': dotColors[activeDot] } as React.CSSProperties} onClick={() => scrollToDot(index)} />)}
            </div>
          </header>

          <div className="hero-grid">
            <div className="hero-art" aria-label="Shelf app preview">
              {stickerScenes.map((scene, index) => <Fragment key={index}>
                <div className="sticker-set sticker-set-behind" data-slide={index} aria-hidden="true" style={stickerLayerStyle(index)}>
                  {scene.behind.map(sticker => <img key={sticker.name} className={`sticker sticker-${sticker.name}`} src={`/svg/${encodeURIComponent(sticker.file)}`} alt="" draggable="false" />)}
                </div>
                <div className="sticker-set sticker-set-front" data-slide={index} aria-hidden="true" style={stickerLayerStyle(index)}>
                  {scene.front.map(sticker => <img key={sticker.name} className={`sticker sticker-${sticker.name}`} src={`/svg/${encodeURIComponent(sticker.file)}`} alt="" draggable="false" />)}
                </div>
              </Fragment>)}
              <div className="phone" aria-label={`iPhone preview ${activeHeadline + 1}`}>
                {screenImages.map((src, index) => {
                  const weight = weights[index];
                  const blur = Math.sin(Math.PI * Math.min(1, Math.abs(scrollProgress - index))) * 7;
                  return <img key={src} className="phone-svg" src={src} alt={index === activeHeadline ? `Shelf app screen ${index + 1}` : ''} aria-hidden={index !== activeHeadline} draggable="false" style={{ opacity: weight, filter: `blur(${blur}px)`, transform: `translate3d(0, ${(index - scrollProgress) * 11}px, 0)` }} />;
                })}
              </div>
            </div>

            <div className="hero-copy">
              <div className="hero-copy-slides">
                <h1 id="hero-title" className="hero-copy-slide" aria-hidden={activeHeadline !== 0} style={{ opacity: weights[0], filter: `blur(${Math.sin(Math.PI * Math.min(1, Math.abs(scrollProgress))) * 7}px)`, transform: `translate3d(0, ${-scrollProgress * 10}px, 0)`, pointerEvents: weights[0] > 0.8 ? 'auto' : 'none' }}>Keep your<br />context.<br />Find it when it<br /><HeadlineStyleToken /></h1>
                <h1 className="hero-copy-slide" aria-hidden={activeHeadline !== 1} style={{ opacity: weights[1], filter: `blur(${Math.sin(Math.PI * Math.min(1, Math.abs(scrollProgress - 1))) * 7}px)`, transform: `translate3d(0, ${(1 - scrollProgress) * 10}px, 0)` }}>Save the things<br />that matter.<br />Find them when<br />you need them.</h1>
                <h1 className="hero-copy-slide" aria-hidden={activeHeadline !== 2} style={{ opacity: weights[2], filter: `blur(${Math.sin(Math.PI * Math.min(1, Math.abs(scrollProgress - 2))) * 7}px)`, transform: `translate3d(0, ${(2 - scrollProgress) * 10}px, 0)` }}>Your digital life,<br />all together.<br />Ready whenever<br />you need it.</h1>
              </div>
              <div className="waitlist-inline">
                {status === 'success' ? <div className="success-inline"><span><Check size={16} /></span><strong>You’re on the list.</strong></div> : <form onSubmit={handleSubmit}><div className="email-row"><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required /><button type="submit" disabled={status === 'loading'} aria-label="Join the waitlist">{status === 'loading' ? '...' : <ArrowRight size={18} />}</button></div>{status === 'error' && <p className="form-error">Please try again.</p>}</form>}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-reference" role="img" aria-label="Archival blueprint collage" />
        </div>
        <div className="mobile-story">
          <header className="mobile-story-nav nav-wrap">
            <a className="brand" href="#top" aria-label="Shelf home"><img src="/svg/shelf%20logo.svg" width="124" height="41" alt="" /></a>
            <div className="hero-dots" aria-label="Hero sections">
              {[0, 1, 2, 3].map(index => <button key={index} type="button" aria-label={`Go to hero section ${index + 1}`} aria-pressed={activeDot === index} className={activeDot === index ? 'active' : ''} style={{ '--dot-color': dotColors[activeDot] } as React.CSSProperties} onClick={() => scrollToDot(index)} />)}
            </div>
          </header>
          {stickerScenes.map((scene, index) => <section className="mobile-story-step" key={index} aria-label={`Shelf story ${index + 1}`}>
            <div className="mobile-story-copy">
              {index === 0 && <h1>Keep your<br />context.<br />Find it when it<br /><HeadlineStyleToken /></h1>}
              {index === 1 && <h1>Save the things<br />that matter.<br />Find them when<br />you need them.</h1>}
              {index === 2 && <h1>Your digital life,<br />all together.<br />Ready whenever<br />you need it.</h1>}
              {index === 2 && <div className="waitlist-inline mobile-waitlist">
                {status === 'success' ? <div className="success-inline"><span><Check size={16} /></span><strong>You’re on the list.</strong></div> : <form onSubmit={handleSubmit}><div className="email-row"><input id="email-mobile" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Your email address" required /><button type="submit" disabled={status === 'loading'} aria-label="Join the waitlist">{status === 'loading' ? '...' : <ArrowRight size={18} />}</button></div>{status === 'error' && <p className="form-error">Please try again.</p>}</form>}
              </div>}
            </div>
            <div className="mobile-story-art" aria-hidden="true">
              <div className="sticker-set sticker-set-behind">
                {scene.behind.map(sticker => <img key={sticker.name} className={`sticker sticker-${sticker.name}`} src={`/svg/${encodeURIComponent(sticker.file)}`} alt="" draggable="false" />)}
              </div>
              <div className="sticker-set sticker-set-front">
                {scene.front.map(sticker => <img key={sticker.name} className={`sticker sticker-${sticker.name}`} src={`/svg/${encodeURIComponent(sticker.file)}`} alt="" draggable="false" />)}
              </div>
              <img className="mobile-story-phone" src={screenImages[index]} alt="" draggable="false" />
            </div>
          </section>)}
        </div>
      </section>
      <BrickFooter />
    </main>
  );
}
