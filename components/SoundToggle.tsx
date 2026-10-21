'use client';

import { useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSoundEnabled } from '../hooks/useSoundEnabled';
import { playUiSound } from '../lib/ui-sound';
import styles from './SoundToggle.module.css';

type Props = {
  /** 'corner' sits beside the hero dots on desktop, 'header' sits by the mobile menu button. */
  variant?: 'corner' | 'header';
  className?: string;
  /** Set to -1 while a menu is closed so hidden items stay out of the tab order. */
  tabIndex?: number;
};

export default function SoundToggle({ variant = 'corner', className = '', tabIndex }: Props) {
  const { enabled, toggle } = useSoundEnabled();

  const onClick = useCallback(() => {
    const next = !enabled;
    toggle();
    // A short confirmation blip, so turning sound back on is audible.
    if (next) playUiSound('success', { intensity: 0.45 });
  }, [enabled, toggle]);

  return (
    <button
      type="button"
      className={`${styles.toggle} ${styles[variant]} ${className}`.trim()}
      onClick={onClick}
      aria-pressed={enabled}
      aria-label="Sound"
      title={enabled ? 'Sound on' : 'Sound off'}
      tabIndex={tabIndex}
    >
      {enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
    </button>
  );
}
