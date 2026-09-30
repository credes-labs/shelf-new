'use client';

import { CSSProperties, ReactNode, useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl';
import './DitherVeil.css';

export type DitherPattern = 'bayer' | 'noise' | 'atkinson' | 'floyd' | 'lines';
export type DitherPalette = 'duotone' | 'rgb';

export type DitherVeilProps = {
  src?: string;
  fit?: 'contain' | 'cover';
  pattern?: DitherPattern;
  palette?: DitherPalette;
  pixelSize?: number;
  levels?: number;
  inkColor?: string;
  paperColor?: string;
  contrast?: number;
  brightness?: number;
  revealRadius?: number;
  softness?: number;
  linger?: number;
  rimColor?: string;
  rim?: number;
  reverse?: boolean;
  wander?: boolean;
  clickBurst?: boolean;
  transparentPaper?: boolean;
  listenToParent?: boolean;
  ariaHidden?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const TRAIL_COUNT = 12;
const BURST_COUNT = 4;
const BURST_SECONDS = 1.2;
const DEFAULT_SRC = 'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop';

const vertex = `
#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `
#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D tImage;
uniform vec2 uResolution;
uniform vec2 uImageSize;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uPixelSize;
uniform float uLevels;
uniform float uContrast;
uniform float uBrightness;
uniform float uRadius;
uniform float uSoftness;
uniform float uPattern;
uniform float uPalette;
uniform float uFit;
uniform float uTransparentPaper;
uniform float uReverse;
uniform float uRim;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uRimColor;
uniform vec4 uTrail[12];
uniform vec4 uBursts[4];
uniform float uBurstWidth;
uniform float uIntro;

float bayer4(vec2 p) {
  float x = mod(p.x, 4.0);
  float y = mod(p.y, 4.0);
  if (y < 1.0) {
    if (x < 1.0) return 0.03125;
    if (x < 2.0) return 0.53125;
    if (x < 3.0) return 0.15625;
    return 0.65625;
  }
  if (y < 2.0) {
    if (x < 1.0) return 0.78125;
    if (x < 2.0) return 0.28125;
    if (x < 3.0) return 0.90625;
    return 0.40625;
  }
  if (y < 3.0) {
    if (x < 1.0) return 0.21875;
    if (x < 2.0) return 0.71875;
    if (x < 3.0) return 0.09375;
    return 0.59375;
  }
  if (x < 1.0) return 0.96875;
  if (x < 2.0) return 0.46875;
  if (x < 3.0) return 0.84375;
  return 0.34375;
}

float randomThreshold(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float thresholdAt(vec2 p) {
  if (uPattern > 3.5) return fract((p.x + p.y) / 6.0);
  if (uPattern > 0.5 && uPattern < 1.5) return randomThreshold(p);
  return bayer4(p);
}

vec2 coverUv(vec2 uv, out float insideImage) {
  float ratio = (uResolution.x / uResolution.y) / (uImageSize.x / uImageSize.y);
  vec2 p = uv;
  if (uFit > 0.5) {
    if (ratio > 1.0) p.x = (uv.x - 0.5) * ratio + 0.5;
    else p.y = (uv.y - 0.5) / ratio + 0.5;
  } else {
    if (ratio > 1.0) p.y = (uv.y - 0.5) / ratio + 0.5;
    else p.x = (uv.x - 0.5) * ratio + 0.5;
  }
  insideImage = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);
  return clamp(p, 0.0, 1.0);
}

float revealAt(vec2 point) {
  float mask = 0.0;
  float edge = max(uRadius * clamp(uSoftness, 0.0, 1.0), 1.0);
  if (uPointerActive > 0.0) {
    float d = distance(point, uPointer);
    mask = max(mask, 1.0 - smoothstep(uRadius - edge, uRadius + edge, d));
  }
  for (int i = 0; i < 12; i++) {
    vec4 stamp = uTrail[i];
    if (stamp.w > 0.001) {
      float d = distance(point, stamp.xy);
      float stampMask = 1.0 - smoothstep(uRadius - edge, uRadius + edge, d);
      mask = max(mask, stampMask * stamp.w);
    }
  }
  for (int i = 0; i < 4; i++) {
    vec4 burst = uBursts[i];
    if (burst.w > 0.001) {
      float d = distance(point, burst.xy);
      float ring = 1.0 - smoothstep(uBurstWidth * 0.15, uBurstWidth, abs(d - burst.z));
      mask = max(mask, ring * burst.w);
    }
  }
  return clamp(mask, 0.0, 1.0);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / uPixelSize);
  vec2 cellUv = (cell + 0.5) * uPixelSize / uResolution;
  float insideImage;
  vec2 imageUv = coverUv(cellUv, insideImage);
  vec4 source = texture(tImage, imageUv);
  float sourceAlpha = source.a * insideImage;
  vec3 graded = clamp((source.rgb - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
  float gray = dot(graded, vec3(0.2126, 0.7152, 0.0722));
  float threshold = thresholdAt(cell);
  float steps = max(uLevels - 1.0, 1.0);
  float grayLevel = clamp(floor(gray * steps + threshold) / steps, 0.0, 1.0);
  vec3 ditherColor;
  float ditherAlpha;
  if (uPalette > 0.5) {
    ditherColor = floor(graded * steps + vec3(threshold)) / steps;
    ditherAlpha = sourceAlpha;
  } else {
    ditherColor = mix(uInk, uPaper, grayLevel);
    ditherAlpha = sourceAlpha;
  }
  if (uTransparentPaper > 0.5) {
    ditherColor = uInk;
    ditherAlpha = sourceAlpha * (1.0 - grayLevel);
  }

  vec2 point = vec2(cellUv.x, 1.0 - cellUv.y) * uResolution;
  float reveal = revealAt(point);
  float shown = mix(reveal, 1.0 - reveal, uReverse);
  vec3 color = mix(ditherColor, source.rgb, shown);
  float alpha = mix(ditherAlpha, sourceAlpha, shown);
  if (uRim > 0.0 && reveal > 0.01 && reveal < 0.99) {
    color = mix(color, uRimColor, (1.0 - abs(reveal * 2.0 - 1.0)) * uRim);
  }
  float intro = smoothstep(0.0, 1.0, uIntro);
  fragColor = vec4(color, alpha * intro);
}`;

function hexToRgb(hex: string): [number, number, number] {
  let value = hex.replace('#', '');
  if (value.length === 3) value = value.split('').map((char) => char + char).join('');
  const parsed = Number.parseInt(value.slice(0, 6), 16);
  if (Number.isNaN(parsed)) return [0, 0, 0];
  return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
}

export default function DitherVeil({
  src = DEFAULT_SRC,
  fit = 'cover',
  pattern = 'floyd',
  palette = 'duotone',
  pixelSize = 2,
  levels = 2,
  inkColor = '#120f17',
  paperColor = '#f4f1ea',
  contrast = 1.15,
  brightness = 0,
  revealRadius = 200,
  softness = 0.6,
  linger = 1,
  rimColor = '#a78bfa',
  rim = 0,
  reverse = false,
  wander = false,
  clickBurst = true,
  transparentPaper = false,
  listenToParent = false,
  ariaHidden = false,
  className = '',
  style,
  children,
}: DitherVeilProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef({
    fit, pattern, palette, pixelSize, levels, inkColor, paperColor, contrast, brightness,
    revealRadius, softness, linger, rimColor, rim, reverse, wander, clickBurst,
  });
  const wakeRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    settingsRef.current = {
      fit, pattern, palette, pixelSize, levels, inkColor, paperColor, contrast, brightness,
      revealRadius, softness, linger, rimColor, rim, reverse, wander, clickBurst,
    };
    wakeRef.current();
  }, [fit, pattern, palette, pixelSize, levels, inkColor, paperColor, contrast, brightness, revealRadius, softness, linger, rimColor, rim, reverse, wander, clickBurst]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: true, antialias: false });
    } catch {
      return;
    }
    const gl = renderer.gl;
    if (!gl) return;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const imageTexture = new Texture(gl, { minFilter: gl.LINEAR, magFilter: gl.LINEAR, generateMipmaps: false });
    const trail = Array.from({ length: TRAIL_COUNT }, () => [0, 0, 0, 0]);
    const bursts = Array.from({ length: BURST_COUNT }, () => [0, 0, 0, 0]);
    const uniforms = {
      tImage: { value: imageTexture },
      uResolution: { value: [1, 1] },
      uImageSize: { value: [1, 1] },
      uPointer: { value: [0, 0] },
      uPointerActive: { value: 0 },
      uPixelSize: { value: 2 },
      uLevels: { value: 2 },
      uContrast: { value: 1.15 },
      uBrightness: { value: 0 },
      uRadius: { value: 200 },
      uSoftness: { value: 0.6 },
      uPattern: { value: 0 },
      uPalette: { value: 0 },
      uFit: { value: 0 },
      uTransparentPaper: { value: 0 },
      uReverse: { value: 0 },
      uRim: { value: 0 },
      uInk: { value: [0, 0, 0] },
      uPaper: { value: [1, 1, 1] },
      uRimColor: { value: [1, 1, 1] },
      uTrail: { value: trail },
      uBursts: { value: bursts },
      uBurstWidth: { value: 60 },
      uIntro: { value: 0 },
    };
    const program = new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false });
    const mesh = new Mesh(gl, { geometry, program });
    let image: HTMLImageElement | null = null;
    let width = 1;
    let height = 1;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    let introStart = 0;
    let pointerInside = false;
    let pointerPlaced = false;
    let pointerX = 0;
    let pointerY = 0;
    let wanderStart = performance.now();
    const trailPoints: { x: number; y: number; time: number }[] = [];
    const burstPoints: { x: number; y: number; time: number }[] = [];
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const inputTarget = listenToParent ? container.parentElement ?? container : container;

    const layout = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height);
      uniforms.uResolution.value = [canvas.width, canvas.height];
      if (image) uniforms.uImageSize.value = [image.naturalWidth, image.naturalHeight];
      if (!pointerPlaced) {
        pointerX = width / 2;
        pointerY = height / 2;
      }
    };

    const locate = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      pointerPlaced = true;
    };
    const onMove = (event: PointerEvent) => {
      locate(event);
      if (!pointerInside) pointerInside = true;
      const now = performance.now();
      trailPoints.push({ x: pointerX, y: pointerY, time: now });
      if (trailPoints.length > TRAIL_COUNT) trailPoints.shift();
      wake();
    };
    const onLeave = () => { pointerInside = false; wake(); };
    const onDown = (event: PointerEvent) => {
      onMove(event);
      if (!settingsRef.current.clickBurst || (event.pointerType === 'mouse' && event.button !== 0)) return;
      burstPoints.push({ x: pointerX, y: pointerY, time: performance.now() });
      if (burstPoints.length > BURST_COUNT) burstPoints.shift();
    };

    const frame = (now: number) => {
      raf = 0;
      const settings = settingsRef.current;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const canWander = settings.wander && !reducedMotion && !pointerInside;
      let x = pointerX;
      let y = pointerY;
      if (canWander) {
        const time = (now - wanderStart) / 1000;
        x = width * (0.5 + 0.3 * Math.sin(time * 0.55));
        y = height * (0.5 + 0.28 * Math.cos(time * 0.7));
      }
      const dpr = renderer.dpr;
      uniforms.uPointer.value = [x * dpr, (height - y) * dpr];
      uniforms.uPointerActive.value = pointerInside || canWander ? 1 : 0;
      uniforms.uPixelSize.value = Math.max(1, Math.round(settings.pixelSize * dpr));
      uniforms.uLevels.value = Math.max(2, Math.round(settings.levels));
      uniforms.uContrast.value = settings.contrast;
      uniforms.uBrightness.value = settings.brightness;
      uniforms.uRadius.value = settings.revealRadius * dpr;
      uniforms.uSoftness.value = settings.softness;
      uniforms.uPattern.value = settings.pattern === 'noise' ? 1 : settings.pattern === 'lines' ? 4 : settings.pattern === 'bayer' ? 0 : settings.pattern === 'atkinson' ? 2 : 3;
      uniforms.uPalette.value = settings.palette === 'rgb' ? 1 : 0;
      uniforms.uFit.value = settings.fit === 'contain' ? 1 : 0;
      uniforms.uTransparentPaper.value = transparentPaper ? 1 : 0;
      uniforms.uReverse.value = settings.reverse ? 1 : 0;
      uniforms.uRim.value = Math.max(0, Math.min(1, settings.rim));
      uniforms.uInk.value = hexToRgb(settings.inkColor);
      uniforms.uPaper.value = hexToRgb(settings.paperColor);
      uniforms.uRimColor.value = hexToRgb(settings.rimColor);
      uniforms.uIntro.value = image ? Math.min(1, (now - introStart) / 700) : 0;
      uniforms.uBurstWidth.value = Math.max(40, settings.revealRadius * 0.7 * dpr);

      for (let i = 0; i < TRAIL_COUNT; i++) {
        const point = trailPoints[i];
        const strength = point && settings.linger > 0 ? Math.max(0, 1 - (now - point.time) / (settings.linger * 1000)) : 0;
        trail[i] = point ? [point.x * dpr, (height - point.y) * dpr, 0, strength] : [0, 0, 0, 0];
      }
      for (let i = 0; i < BURST_COUNT; i++) {
        const burst = burstPoints[i];
        if (!burst) { bursts[i] = [0, 0, 0, 0]; continue; }
        const progress = Math.min(1, (now - burst.time) / (BURST_SECONDS * 1000));
        const maxRadius = Math.hypot(width, height) * dpr;
        bursts[i] = [burst.x * dpr, (height - burst.y) * dpr, maxRadius * progress, 1 - progress];
      }
      renderer.render({ scene: mesh });

      while (trailPoints.length && now - trailPoints[0].time > settings.linger * 1000) trailPoints.shift();
      while (burstPoints.length && now - burstPoints[0].time > BURST_SECONDS * 1000) burstPoints.shift();
      const busy = pointerInside || canWander || trailPoints.length > 0 || burstPoints.length > 0 || (image && uniforms.uIntro.value < 1);
      if (busy && visible) raf = requestAnimationFrame(frame);
    };

    function wake() {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    wakeRef.current = wake;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      image = img;
      imageTexture.image = img;
      imageTexture.needsUpdate = true;
      uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight];
      introStart = performance.now();
      wake();
    };
    img.src = src;

    inputTarget.addEventListener('pointermove', onMove, { passive: true });
    inputTarget.addEventListener('pointerenter', onMove as EventListener, { passive: true });
    inputTarget.addEventListener('pointerdown', onDown, { passive: true });
    inputTarget.addEventListener('pointerleave', onLeave, { passive: true });
    inputTarget.addEventListener('pointercancel', onLeave, { passive: true });
    const resizeObserver = new ResizeObserver(() => { layout(); wake(); });
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); });
    intersectionObserver.observe(container);
    layout();
    wake();

    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = () => undefined;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      img.onload = null;
      inputTarget.removeEventListener('pointermove', onMove);
      inputTarget.removeEventListener('pointerenter', onMove as EventListener);
      inputTarget.removeEventListener('pointerdown', onDown);
      inputTarget.removeEventListener('pointerleave', onLeave);
      inputTarget.removeEventListener('pointercancel', onLeave);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.parentNode?.removeChild(canvas);
    };
  }, [src, listenToParent, transparentPaper]);

  return <div ref={containerRef} className={`dither-veil ${className}`.trim()} style={style} aria-hidden={ariaHidden || undefined}>
    <div className="dither-veil-content">{children}</div>
  </div>;
}
