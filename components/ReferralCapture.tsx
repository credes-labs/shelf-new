'use client';

import { useEffect } from 'react';
import { captureReferralFromUrl } from '../lib/waitlist-client';

/** Captures ?ref= from any landing page once, then stays out of the way. */
export default function ReferralCapture() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);
  return null;
}
