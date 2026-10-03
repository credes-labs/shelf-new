'use client';

import StickerPeel from './StickerPeel';

export type PeelDef = {
  file: string;
  place: string;
  width: number;
  rotate: number;
  peelDirection: number;
  hover: number;
  active: number;
};

/**
 * Split from WaitlistSignup so gsap/Draggable + peel code only downloads
 * when the popup actually opens — never in the initial page bundle.
 * Styling comes from global classes (see globals.css) so this chunk
 * carries no CSS of its own.
 */
export default function ModalPeels({ peels }: { peels: PeelDef[] }) {
  return (
    <div className="waitlist-peel-field" aria-hidden="true">
      {peels.map((sticker, index) => (
        <StickerPeel
          key={sticker.file}
          imageSrc={`/svg/${encodeURIComponent(sticker.file)}`}
          width={sticker.width}
          rotate={sticker.rotate}
          peelDirection={sticker.peelDirection}
          peelBackHoverPct={sticker.hover}
          peelBackActivePct={sticker.active}
          className={`waitlist-peel waitlist-peel-${sticker.place}`}
          style={{ '--d': `${index * 45}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
