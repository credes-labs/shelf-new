'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { getServerSoundSnapshot, getSoundSnapshot, setSoundEnabled, subscribeSound } from '../lib/ui-sound';

/** Sound on/off state, shared across the whole site and remembered between visits. */
export function useSoundEnabled() {
  const enabled = useSyncExternalStore(subscribeSound, getSoundSnapshot, getServerSoundSnapshot);

  const setEnabled = useCallback((next: boolean) => {
    setSoundEnabled(next);
  }, []);

  const toggle = useCallback(() => {
    setSoundEnabled(!getSoundSnapshot());
  }, []);

  return { enabled, setEnabled, toggle };
}
