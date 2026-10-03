'use client';

export type UiSound =
  | 'hover'
  | 'click'
  | 'scroll'
  | 'sticker'
  | 'stickerTap'
  | 'navigation'
  | 'waitlist'
  | 'success'
  | 'error'
  | 'menu'
  | 'close';

type Tone = { frequency: number; type: OscillatorType; duration: number; volume: number };

let context: AudioContext | null = null;
let unlockInstalled = false;
let soundEnabled = true;

/** Round-robin counters guarantee audible variation instead of pure randomness. */
const variationIndex: Record<string, number> = {};
/** Last play timestamp per kind, for throttling. */
const lastPlayAt: Record<string, number> = {};
let lastAnyPlayAt = 0;

const THROTTLE_MS: Record<UiSound, number> = {
  hover: 70,
  click: 40,
  scroll: 50,
  sticker: 200,
  stickerTap: 60,
  navigation: 80,
  waitlist: 150,
  success: 150,
  error: 150,
  menu: 120,
  close: 120,
};

/** Pentatonic-ish semitone ladders per kind so repeats never sound identical. */
const VARIATION_LADDERS: Record<UiSound, number[]> = {
  hover: [0, 3, 5, 7, 10, 12, 7, 5],
  click: [0, -2, 2, 5, -3, 4],
  scroll: [0, 2, 4, 7, 9, 12, 14, 16, 12, 7],
  sticker: [0, 4, 7, 12, 7, 4],
  stickerTap: [0, -3, 3, -5, 5, 0],
  navigation: [0, 5, 7, 12],
  waitlist: [0, 4, 7],
  success: [0, 2, 4],
  error: [0, -2, -4],
  menu: [0, 3, 5],
  close: [0, -2, -4],
};

const tones: Record<UiSound, Tone> = {
  hover: { frequency: 1180, type: 'sine', duration: 0.055, volume: 0.022 },
  click: { frequency: 640, type: 'triangle', duration: 0.075, volume: 0.05 },
  scroll: { frequency: 1650, type: 'triangle', duration: 0.032, volume: 0.028 },
  sticker: { frequency: 1040, type: 'sine', duration: 0.075, volume: 0.045 },
  stickerTap: { frequency: 690, type: 'triangle', duration: 0.095, volume: 0.05 },
  navigation: { frequency: 760, type: 'sine', duration: 0.085, volume: 0.045 },
  waitlist: { frequency: 880, type: 'sine', duration: 0.16, volume: 0.05 },
  success: { frequency: 1040, type: 'sine', duration: 0.19, volume: 0.05 },
  error: { frequency: 260, type: 'triangle', duration: 0.13, volume: 0.042 },
  menu: { frequency: 560, type: 'triangle', duration: 0.11, volume: 0.042 },
  close: { frequency: 440, type: 'triangle', duration: 0.095, volume: 0.038 },
};

function semitonesToRatio(semitones: number): number {
  return Math.pow(2, semitones / 12);
}

function nextVariation(kind: UiSound): number {
  const ladder = VARIATION_LADDERS[kind];
  const i = (variationIndex[kind] ?? 0) % ladder.length;
  variationIndex[kind] = (variationIndex[kind] ?? 0) + 1;
  const jitter = (Math.random() - 0.5) * 0.8; // ±0.4 semitones of human wobble
  return semitonesToRatio(ladder[i] + jitter);
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!context) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
      installUnlock();
    }
    return context;
  } catch {
    return null;
  }
}

function installUnlock(): void {
  if (unlockInstalled || typeof window === 'undefined') return;
  unlockInstalled = true;
  const unlock = () => {
    try {
      const audio = getContext();
      if (audio && audio.state === 'suspended') void audio.resume().catch(() => undefined);
    } catch {
      /* decorative audio only */
    }
  };
  // A hover alone does not count as an autoplay gesture, so unlock on any
  // real interaction. Afterwards the shared context stays warm for hovers.
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  window.addEventListener('wheel', unlock, { passive: true });
}

/** Lets the global manager suppress a generic blip when an explicit cue just fired. */
export function lastSoundAgeMs(now = performance.now()): number {
  return now - lastAnyPlayAt;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export type PlayOptions = {
  /** 0..1 velocity/intensity — raises scroll/click pitch and volume slightly. */
  intensity?: number;
  /** Skip the per-kind throttle (used sparingly). */
  force?: boolean;
};

function blip(
  audio: AudioContext,
  start: number,
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number,
  slideRatio = 0.76,
  delay = 0,
): void {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(40, frequency), start + delay);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * slideRatio), start + delay + duration);
  gain.gain.setValueAtTime(0.0001, start + delay);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + delay + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + delay + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start + delay);
  oscillator.stop(start + delay + duration + 0.02);
}

/** Tiny synthesized interface cues; no audio assets or extra runtime dependencies. */
export function playUiSound(kind: UiSound, options: PlayOptions = {}): void {
  if (typeof window === 'undefined' || !soundEnabled) return;
  const now = performance.now();
  const throttle = THROTTLE_MS[kind] ?? 60;
  if (!options.force && now - (lastPlayAt[kind] ?? 0) < throttle) return;
  lastPlayAt[kind] = now;
  lastAnyPlayAt = now;

  const audio = getContext();
  if (!audio) return;

  const intensity = Math.max(0, Math.min(1, options.intensity ?? 0.5));
  const sound = tones[kind];
  const variation = nextVariation(kind);
  // Louder/faster gestures pitch up slightly and hit a touch harder.
  const intensityPitch = 1 + (intensity - 0.5) * (kind === 'scroll' ? 0.35 : 0.14);
  const intensityVolume = 1 + (intensity - 0.5) * (kind === 'scroll' ? 0.9 : 0.4);
  const frequency = sound.frequency * variation * intensityPitch;
  const volume = Math.max(0.0002, sound.volume * intensityVolume * (0.9 + Math.random() * 0.2));

  const play = () => {
    if (audio.state !== 'running') return;
    const start = audio.currentTime;
    // Alternate oscillator flavor every few hits so clicks/hovers don't get fatiguing.
    const flavor: OscillatorType =
      kind === 'click' && (variationIndex[kind] ?? 0) % 3 === 0 ? 'square' : sound.type;
    const flavorVolume = flavor === 'square' ? volume * 0.45 : volume;

    if (kind === 'scroll') {
      // Short dial tick: two staggered pings like a ratchet.
      blip(audio, start, frequency, 'triangle', sound.duration, volume, 0.72, 0);
      blip(audio, start, frequency * 0.68, 'sine', 0.026, volume * 0.5, 0.7, 0.028);
      return;
    }

    if (kind === 'click') {
      blip(audio, start, frequency, flavor, sound.duration, flavorVolume, 0.62, 0);
      blip(audio, start, frequency * 1.98, 'sine', 0.04, volume * 0.35, 0.8, 0.006);
      return;
    }

    if (kind === 'hover') {
      blip(audio, start, frequency, 'sine', sound.duration, volume, 0.88, 0);
      return;
    }

    blip(audio, start, frequency, sound.type, sound.duration, volume, 0.76, 0);

    if (kind === 'waitlist' || kind === 'success' || kind === 'menu') {
      blip(audio, start, frequency * (kind === 'success' ? 1.5 : 1.34), 'sine', sound.duration, volume * 0.58, 0.95, 0.045);
    }
    if (kind === 'success') {
      blip(audio, start, frequency * 2, 'sine', 0.12, volume * 0.3, 0.95, 0.11);
    }
  };

  if (audio.state === 'running') play();
  else void audio.resume().then(play).catch(() => undefined);
}

/** Convenience wrappers used by the global listeners. */
export function playHoverSound(intensity = 0.4): void {
  // Hover alone can't unlock autoplay, so this is a no-op until first gesture.
  playUiSound('hover', { intensity });
}

export function playClickSound(intensity = 0.6): void {
  playUiSound('click', { intensity });
}

export function playScrollTick(intensity = 0.5): void {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  playUiSound('scroll', { intensity });
}

export function ensureAudioUnlocked(): void {
  const audio = getContext();
  if (audio && audio.state === 'suspended') void audio.resume().catch(() => undefined);
}
