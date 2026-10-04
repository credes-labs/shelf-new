'use client';

import { Fragment, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import SiteHeader from '../components/SiteHeader';
import WaitlistSignup from '../components/WaitlistSignup';
import HeadlineStyleToken from '../components/HeadlineStyleToken';
import { playScrollTick, playUiSound } from '../lib/ui-sound';
import DataTypeIcons from '../components/DataTypeIcons';

// Below-the-fold game: split into its own chunk, still server-rendered,
// so first paint downloads less JavaScript with identical HTML.
const BrickFooter = dynamic(() => import('../components/BrickFooter'));

type HeroSticker = { file: string; name: string };
type StickerScene = { behind: HeroSticker[]; front: HeroSticker[] };

function PhoneScreens({ progress, screenImages, mobile = false }: { progress: number; screenImages: string[]; mobile?: boolean }) {
  const current = Math.min(screenImages.length - 1, Math.floor(progress));
  const phase = current === screenImages.length - 1 ? 0 : progress - current;
  const eased = phase * phase * (3 - 2 * phase);
  const screenClass = mobile ? 'mobile-story-phone' : 'phone-svg';

  return <>
    <div className="phone-screen-window" aria-hidden="true">
      {screenImages.map((src, index) => {
        const opacity = index === current
          ? 1 - eased
          : index === current + 1
            ? eased
            : index === screenImages.length - 1 && progress >= screenImages.length - 1
              ? 1
              : 0;
        const distance = Math.min(1, Math.abs(index - progress));
        // Preserve the original scroll-linked screen glide and blur. The two
        // screens overlap during the handoff, then settle sharply at each stop.
        // Mobile keeps the glide but drops the blur.
        const blur = mobile ? 0 : Math.sin(distance * Math.PI) * 7;
        const y = (index - progress) * 11;
        const brightness = 1 - Math.sin(distance * Math.PI) * 0.025;
        return <img
          key={src}
          className={screenClass}
          src={src}
          alt=""
          aria-hidden="true"
          data-active={index === Math.round(progress)}
          draggable="false"
          style={{
            opacity,
            filter: `blur(${blur.toFixed(2)}px) brightness(${brightness.toFixed(3)})`,
            transform: `translate3d(0, ${y.toFixed(2)}px, 0)`,
            zIndex: index + 1,
          }}
        />;
      })}
    </div>
    <img className="phone-boundary" src="/svg/iphone%20boundary.svg" alt="" draggable="false" />
  </>;
}

const stickerChats: Record<string, [string, string]> = {
  spider: ['found a tiny roommate', 'They have been here a while.'],
  alarm: ['gentle reminder', 'You can take your time.'],
  coin: ['keeping this close', 'A little thing with a story.'],
  special: ['saved for later', 'Future you says thanks.'],
  polaroid: ['this one feels familiar', 'Some moments stick.'],
  receipt: ['proof it happened', 'Filed under: good days.'],
  smile: ['sending a little joy', 'Right back at you.'],
  flower: ['picked this for you', 'It brightens the collection.'],
  pink: ['a small favorite', 'Saved exactly where it belongs.'],
  yellow: ['this caught your eye', 'Of course it did.'],
  'cd-blue': ['what are we listening to?', 'Something on repeat.'],
  'cd-red': ['putting this on', 'Track one, obviously.'],
  'cd-yellow': ['a sunny soundtrack', 'Saved for the right mood.'],
  ipod: ['playlist from another time', 'Still knows every word.'],
  notes: ['quick thought', 'Good thing you saved it.'],
  key: ['this opens something', 'Maybe a very good memory.'],
  cassette: ['mixtape energy', 'Side A is the best side.'],
  calculator: ['doing the math', 'The answer is: keep it.'],
  controller: ['one more round?', 'After you finish scrolling.'],
  clothes: ['outfit idea saved', 'Future plans look good.'],
  'blue-flower': ['a blue little bloom', 'Growing on your shelf.'],
  wallet: ['keeping it together', 'One pocket at a time.'],
  matcha: ['a little pick-me-up', 'This is your sign to pause.'],
  umbrella: ['just in case', 'Forecast: probably fine.'],
  piggybank: ['saving something good', 'Every little bit counts.'],
  notepad: ['note to self', 'You already remembered.'],
};

function InteractiveSticker({ sticker }: { sticker: HeroSticker }) {
  const [open, setOpen] = useState(false);
  const touchTap = useRef(false);
  const [first, second] = stickerChats[sticker.name] ?? ['saved to your shelf', 'You can find it here later.'];

  return (
    <button
      type="button"
      className={`sticker sticker-${sticker.name}`}
      aria-label={`${sticker.name.replace(/-/g, ' ')} sticker. ${first}. ${second}`}
      aria-expanded={open}
      data-open={open}
      onPointerEnter={event => {
        if (event.pointerType === 'touch') return;
        setOpen(true);
        playUiSound('sticker');
      }}
      onPointerLeave={event => {
        if (event.pointerType !== 'touch') setOpen(false);
      }}
      onPointerDown={event => {
        if (event.pointerType !== 'touch') return;
        touchTap.current = true;
        setOpen(value => !value);
        playUiSound('stickerTap');
      }}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={event => {
        if (touchTap.current) {
          touchTap.current = false;
          return;
        }
        if (event.detail === 0) setOpen(value => !value);
        else setOpen(true);
        playUiSound('stickerTap');
      }}
      onPointerMove={moveStickerParallax}
    >
      <img className="sticker-art" src={`/svg/${encodeURIComponent(sticker.file)}`} alt="" draggable="false" />
      <span className="sticker-chat" aria-hidden={!open}>
        <span className="sticker-chat-green">{first}</span>
        <span className="sticker-chat-white">{second}</span>
      </span>
    </button>
  );
}

function moveStickerParallax(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const art = event.currentTarget.closest<HTMLElement>('.hero-art, .mobile-story-art');
  if (!art) return;
  const bounds = art.getBoundingClientRect();
  const x = event.clientX - bounds.left - bounds.width / 2;
  const y = event.clientY - bounds.top - bounds.height / 2;
  art.style.setProperty('--cursor-x-front', `${x * 0.055}px`);
  art.style.setProperty('--cursor-y-front', `${y * 0.055}px`);
  art.style.setProperty('--cursor-x-behind', `${x * 0.03}px`);
  art.style.setProperty('--cursor-y-behind', `${y * 0.03}px`);
}

function resetStickerParallax(event: ReactPointerEvent<HTMLElement>) {
  const art = event.currentTarget.closest<HTMLElement>('.hero-art, .mobile-story-art');
  if (!art) return;
  art.style.setProperty('--cursor-x-front', '0px');
  art.style.setProperty('--cursor-y-front', '0px');
  art.style.setProperty('--cursor-x-behind', '0px');
  art.style.setProperty('--cursor-y-behind', '0px');
}

type EdgeSticker = { file: string; style: React.CSSProperties };

/** Small continuity stickers bridging one mobile panel into the next. */
const edgeStickers: [EdgeSticker, EdgeSticker][] = [
  [
    { file: 'coin.svg', style: { right: '12px', top: 'calc(84px + env(safe-area-inset-top))', transform: 'rotate(-12deg)' } },
    { file: 'flower.svg', style: { left: '12px', bottom: '10px', transform: 'rotate(10deg)' } },
  ],
  [
    { file: 'smile sticker.svg', style: { left: '12px', top: 'calc(84px + env(safe-area-inset-top))', transform: 'rotate(8deg)' } },
    { file: 'pinkstamp.svg', style: { right: '12px', bottom: '10px', transform: 'rotate(14deg)' } },
  ],
  [
    { file: 'yellowstamp.svg', style: { right: '12px', top: 'calc(84px + env(safe-area-inset-top))', transform: 'rotate(-8deg)' } },
    { file: 'controller.svg', style: { left: '12px', bottom: '10px', width: '54px', transform: 'rotate(-10deg)' } },
  ],
];

const stickerScenes: StickerScene[] = [  {
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const soundStep = useRef(0);
  const lastSoundAt = useRef(0);

  useEffect(() => {
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
        // Desktop uses the pinned scene's travel distance. Mobile story panels
        // are each one small viewport tall, so measure a panel directly instead
        // of relying on the browser's changing visual viewport height.
        const rect = section.getBoundingClientRect();
        const isMobileStory = window.matchMedia('(max-width: 900px)').matches;
        const firstStoryStep = isMobileStory ? section.querySelector<HTMLElement>('.mobile-story-step') : null;
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        const distance = isMobileStory && firstStoryStep
          ? firstStoryStep.getBoundingClientRect().height
          : Math.max(1, rect.height - viewportHeight);
        const next = Math.max(0, Math.min(2, (-rect.top / distance) * (isMobileStory ? 1 : 2)));
        setScrollProgress(value => Math.abs(value - next) > 0.004 ? next : value);
        const nextStep = Math.floor(next * 8 + 0.001);
        if (nextStep !== soundStep.current) {
          const stepsMoved = Math.abs(nextStep - soundStep.current);
          soundStep.current = nextStep;
          // Hero dial ratchet: harder flicks pitch up. Throttled in the engine.
          const now = performance.now();
          if (now - lastSoundAt.current > 50) {
            lastSoundAt.current = now;
            playScrollTick(0.35 + Math.min(0.6, stepsMoved * 0.2));
          }
        }
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    document.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    const resizeObserver = heroRef.current ? new ResizeObserver(update) : null;
    if (heroRef.current) resizeObserver?.observe(heroRef.current);
    window.addEventListener('pageshow', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      document.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.removeEventListener('pageshow', update);
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
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
    const isMobileStory = window.matchMedia('(max-width: 900px)').matches;
    const firstStoryStep = isMobileStory ? section.querySelector<HTMLElement>('.mobile-story-step') : null;
    const range = firstStoryStep
      ? firstStoryStep.getBoundingClientRect().height * 2
      : section.offsetHeight - (window.visualViewport?.height ?? window.innerHeight);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + range * (index / 3), behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const stickerLayerStyle = (index: number): React.CSSProperties => {
    return { opacity: 1, transform: `translate3d(0, ${(index - scrollProgress) * 100}vh, 0)` };
  };
  const renderDots = (className: string) => <nav className={`hero-dots ${className}`} aria-label="Hero sections">
    {[0, 1, 2, 3].map(index => <button key={index} type="button" aria-label={`Go to hero section ${index + 1}`} aria-current={activeDot === index ? 'step' : undefined} className={activeDot === index ? 'active' : ''} style={{ '--dot-color': dotColors[activeDot] } as React.CSSProperties} onClick={() => { playUiSound('navigation'); scrollToDot(index); }} />)}
  </nav>;

  return (
    <main className="site-shell">
      <section ref={heroRef} className="hero" id="top" aria-label="Shelf app introduction">
        <div className="hero-stage">
        <div className="hero-blue">
          <SiteHeader />

          <div className="hero-grid">
            <div className="hero-art" aria-label="Shelf app preview" onPointerMove={moveStickerParallax} onPointerLeave={resetStickerParallax}>
              {stickerScenes.map((scene, index) => <Fragment key={index}>
                <div className="sticker-set sticker-set-behind" data-slide={index} style={stickerLayerStyle(index)}>
                  {scene.behind.map(sticker => <InteractiveSticker key={sticker.name} sticker={sticker} />)}
                </div>
                <div className="sticker-set sticker-set-front" data-slide={index} style={stickerLayerStyle(index)}>
                  {scene.front.map(sticker => <InteractiveSticker key={sticker.name} sticker={sticker} />)}
                </div>
              </Fragment>)}
              <div className="phone" aria-label={`iPhone preview ${activeHeadline + 1}`}>
                <PhoneScreens progress={scrollProgress} screenImages={screenImages} />
              </div>
            </div>

            <div className="hero-copy">
              <DataTypeIcons />
              <div className="hero-copy-slides">
                <h1 id="hero-title" className="hero-copy-slide" aria-hidden={activeHeadline !== 0} style={{ opacity: weights[0], filter: `blur(${Math.sin(Math.PI * Math.min(1, Math.abs(scrollProgress))) * 7}px)`, transform: `translate3d(0, ${-scrollProgress * 10}px, 0)`, pointerEvents: weights[0] > 0.8 ? 'auto' : 'none' }}>Keep your<br />context.<br />Find it when it<br /><HeadlineStyleToken /></h1>
                <h1 className="hero-copy-slide" aria-hidden={activeHeadline !== 1} style={{ opacity: weights[1], filter: `blur(${Math.sin(Math.PI * Math.min(1, Math.abs(scrollProgress - 1))) * 7}px)`, transform: `translate3d(0, ${(1 - scrollProgress) * 10}px, 0)`, pointerEvents: weights[1] > 0.8 ? 'auto' : 'none' }}>Save the things<br />that matter.<br />Find them when<br />you need them.</h1>
                <h1 className="hero-copy-slide" aria-hidden={activeHeadline !== 2} style={{ opacity: weights[2], filter: `blur(${Math.sin(Math.PI * Math.min(1, Math.abs(scrollProgress - 2))) * 7}px)`, transform: `translate3d(0, ${(2 - scrollProgress) * 10}px, 0)`, pointerEvents: weights[2] > 0.8 ? 'auto' : 'none' }}>Your digital life,<br />all together.<br />Ready whenever<br />you need it.</h1>
              </div>
              <WaitlistSignup id="home-waitlist-desktop" className="waitlist-inline" />
            </div>
          </div>
          {renderDots('hero-dots-desktop')}
        </div>

        <div className="hero-reference" role="img" aria-label="Archival blueprint collage" />
        </div>
        <div className="mobile-story">
          <SiteHeader className="mobile-story-nav" />
          {stickerScenes.map((scene, index) => <section className="mobile-story-step" key={index} aria-label={`Shelf story ${index + 1}`}>
            <img className="mobile-story-edge" src={`/svg/${encodeURIComponent(edgeStickers[index][0].file)}`} alt="" aria-hidden="true" draggable="false" style={edgeStickers[index][0].style} />
            <img className="mobile-story-edge" src={`/svg/${encodeURIComponent(edgeStickers[index][1].file)}`} alt="" aria-hidden="true" draggable="false" style={edgeStickers[index][1].style} />
            <div className="mobile-story-art" onPointerMove={moveStickerParallax} onPointerLeave={resetStickerParallax}>
              <div className="sticker-set sticker-set-behind">
                {scene.behind.map(sticker => <InteractiveSticker key={sticker.name} sticker={sticker} />)}
              </div>
              <div className="sticker-set sticker-set-front">
                {scene.front.map(sticker => <InteractiveSticker key={sticker.name} sticker={sticker} />)}
              </div>
              <div className="mobile-phone-frame">
                <PhoneScreens progress={scrollProgress} screenImages={screenImages} mobile />
              </div>
            </div>
            <div className="mobile-story-copy">
              {index === 0 && <h1>Keep your<br />context.<br />Find it when it<br /><HeadlineStyleToken /></h1>}
              {index === 0 && <WaitlistSignup id="home-waitlist-mobile-0" className="waitlist-inline mobile-waitlist" hideProofLabel hideFaces />}
              {index === 1 && <h1>Save the things<br />that matter.<br />Find them when<br />you need them.</h1>}
              {index === 1 && <DataTypeIcons className="dt-row-mobile" />}
              {index === 2 && <h1>Your digital life,<br />all together.<br />Ready whenever<br />you need it.</h1>}
              {index === 2 && <WaitlistSignup id="home-waitlist-mobile" className="waitlist-inline mobile-waitlist" hideProofLabel />}
            </div>
          </section>)}
        </div>
      </section>
      <div className="mobile-footer-gap" aria-hidden="true" />
      <BrickFooter />
    </main>
  );
}
