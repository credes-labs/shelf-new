'use client';

import { useEffect } from 'react';
import { ensureAudioUnlocked, lastSoundAgeMs, playClickSound, playHoverSound, playScrollTick } from '../lib/ui-sound';

const HOVER_SELECTOR = 'a, button, [role="button"], input, select, textarea, summary, [data-sound-hover]';
const CLICK_SELECTOR = 'a, button, [role="button"], input, select, summary, [data-sound-click]';

/**
 * Global delegation: hover blips, click thocks, and scroll ticks with
 * per-gesture variation. Explicit per-component cues (stickers, menu chimes,
 * …) always win — if one fired in the last ~120ms the generic layer stays quiet.
 */
export default function UiSoundManager() {
  useEffect(() => {
    ensureAudioUnlocked();
    let lastScrollAt = 0;
    let lastWheelAt = 0;
    let lastWheelDelta = 0;
    let scrollRaf = 0;

    const isTouchPointer = (event: PointerEvent | MouseEvent): boolean =>
      event instanceof PointerEvent && event.pointerType === 'touch';

    const onPointerOver = (event: Event) => {
      const pointer = event as PointerEvent;
      if (isTouchPointer(pointer)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest?.(HOVER_SELECTOR);
      if (!interactive) return;
      if (interactive.hasAttribute('disabled') || interactive.getAttribute('aria-disabled') === 'true') return;
      // Stickers play their own bespoke hover cue.
      if (interactive.closest?.('.sticker')) return;
      // An explicit cue (e.g. sticker hover) just fired — don't double up.
      if (lastSoundAgeMs() < 120) return;
      playHoverSound(0.35 + Math.random() * 0.3);
    };

    const onClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest?.(CLICK_SELECTOR);
      if (!interactive) return;
      if (lastSoundAgeMs() < 150) return;
      playClickSound(0.5 + Math.random() * 0.3);
    };

    const onScrollTick = (intensity: number) => {
      const now = performance.now();
      if (now - lastScrollAt < 55) return;
      lastScrollAt = now;
      if (lastSoundAgeMs() < 60) return;
      playScrollTick(intensity);
    };

    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        onScrollTick(0.35 + Math.random() * 0.25);
      });
    };

    const onWheel = (event: WheelEvent) => {
      const now = performance.now();
      const delta = Math.abs(event.deltaY) + Math.abs(event.deltaX);
      const velocity = Math.max(0, Math.min(1, delta / 120));
      // Faster flicks tick a little higher/harder; tiny jitters stay quiet.
      if (delta < 4) return;
      if (now - lastWheelAt < 55) {
        lastWheelDelta = delta;
        return;
      }
      lastWheelAt = now;
      lastWheelDelta = delta;
      if (lastSoundAgeMs() < 60) return;
      playScrollTick(0.25 + velocity * 0.6);
    };

    const onPointerDown = () => ensureAudioUnlocked();
    const onKeyDown = (event: KeyboardEvent) => {
      ensureAudioUnlocked();
      if (event.key === 'Enter' || event.key === ' ') {
        const target = event.target;
        if (target instanceof Element && target.closest?.(CLICK_SELECTOR)) {
          if (lastSoundAgeMs() < 150) return;
          playClickSound(0.6);
        }
      }
    };

    document.addEventListener('pointerover', onPointerOver, { passive: true });
    document.addEventListener('click', onClick, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
    };
  }, []);

  return null;
}
