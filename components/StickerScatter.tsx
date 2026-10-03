'use client';

import StickerPeel from './StickerPeel';
import styles from './StickerScatter.module.css';

type ScatterSticker = {
  file: string;
  place: string;
  width: number;
  rotate: number;
  peelDirection: number;
  hover: number;
  active: number;
};

/** Peelable stickers scattered across the About / Blog / Features pages. */
const SCATTER: ScatterSticker[] = [
  { file: 'polaroid.svg', place: 'p0', width: 118, rotate: 9, peelDirection: 0, hover: 26, active: 44 },
  { file: 'coin.svg', place: 'p1', width: 84, rotate: -14, peelDirection: 90, hover: 32, active: 48 },
  { file: 'key.svg', place: 'p2', width: 76, rotate: 18, peelDirection: 180, hover: 28, active: 42 },
  { file: 'umbrella.svg', place: 'p3', width: 96, rotate: -8, peelDirection: 270, hover: 24, active: 40 },
  { file: 'wallet.svg', place: 'p4', width: 104, rotate: 12, peelDirection: 0, hover: 30, active: 46 },
  { file: 'matcha.svg', place: 'p5', width: 78, rotate: -20, peelDirection: 90, hover: 26, active: 44 },
  { file: 'controller.svg', place: 'p6', width: 108, rotate: 6, peelDirection: 180, hover: 32, active: 50 },
  { file: 'blue flower.svg', place: 'p7', width: 88, rotate: -10, peelDirection: 270, hover: 28, active: 42 },
];

export default function StickerScatter({ className = '' }: { className?: string }) {
  return (
    <div className={`${styles.scatter} ${className}`.trim()} aria-hidden="true">
      {SCATTER.map((sticker) => (
        <StickerPeel
          key={sticker.file}
          imageSrc={`/svg/${encodeURIComponent(sticker.file)}`}
          width={sticker.width}
          rotate={sticker.rotate}
          peelDirection={sticker.peelDirection}
          peelBackHoverPct={sticker.hover}
          peelBackActivePct={sticker.active}
          className={styles[sticker.place]}
        />
      ))}
    </div>
  );
}
