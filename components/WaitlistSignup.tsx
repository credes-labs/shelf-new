'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import BookDemoButton from './BookDemoButton';
import WaitlistProof from './WaitlistProof';
import WaitlistForm from './WaitlistForm';
import { ShareCardModal } from './waitlist/ShareCard';
import {
  captureReferralFromUrl,
  readWaitlistState,
  saveWaitlistState,
  type SavedWaitlist,
  type WaitlistSuccess,
} from '../lib/waitlist-client';
import { playUiSound } from '../lib/ui-sound';
import styles from './WaitlistSignup.module.css';

// The most recently claimed external open request (menu entry). Module scope
// so every mounted instance sees it and only the first visible one opens.
let claimedWaitlistEvent = 0;

type Props = {
  id: string;
  className?: string;
  hideProofLabel?: boolean;
  hideFaces?: boolean;
  variant?: 'hero' | 'content';
  children?: ReactNode;
};

export default function WaitlistSignup({
  id,
  className = '',
  hideProofLabel = false,
  hideFaces = false,
  variant = 'hero',
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [joined, setJoined] = useState<SavedWaitlist | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  // The panel stays mounted while it animates out, so closing is not a hard cut.
  const active = open || closing;

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    setMounted(true);
    captureReferralFromUrl();
    setJoined(readWaitlistState());
  }, []);

  // Keep the copy out of the tab order while the form owns the space.
  useEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    if (active) {
      copy.setAttribute('inert', '');
      copy.setAttribute('aria-hidden', 'true');
    } else {
      copy.removeAttribute('inert');
      copy.removeAttribute('aria-hidden');
    }
  }, [active]);

  // On phones the copy block becomes a fixed, scrollable sheet under the nav.
  // The class lives on the story step so the fixed sheet can cover the artwork
  // and the body cannot scroll behind it.
  useEffect(() => {
    if (variant !== 'hero') return;
    const step = rootRef.current?.closest<HTMLElement>('.mobile-story-step');
    if (!step) return;

    const previousOverflow = document.body.style.overflow;
    step.classList.toggle('waitlist-open', active);
    if (active) document.body.style.overflow = 'hidden';

    return () => {
      step.classList.remove('waitlist-open');
      if (active) document.body.style.overflow = previousOverflow;
    };
  }, [active, variant]);

  useEffect(() => {
    const onExternalOpen = (event: Event) => {
      const eventId = (event as CustomEvent<{ id?: number }>).detail?.id ?? 0;
      if (eventId && claimedWaitlistEvent === eventId) return;

      const root = rootRef.current;
      // Hidden copies (desktop vs. mobile) must not claim the request.
      if (!root || root.getClientRects().length === 0) return;
      if (open || cardOpen || closing) return;

      claimedWaitlistEvent = eventId;
      playUiSound('waitlist');

      if (joined) {
        setCardOpen(true);
        return;
      }

      setOpen(true);
      window.setTimeout(() => {
        root.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 220);
    };

    window.addEventListener('shelf:open-waitlist', onExternalOpen);
    return () => window.removeEventListener('shelf:open-waitlist', onExternalOpen);
  }, [joined, open, cardOpen, closing]);

  function focusTrigger() {
    window.setTimeout(() => {
      triggerRef.current?.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
    }, 120);
  }

  function openExperience() {
    playUiSound('waitlist');
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setClosing(false);
    if (joined) {
      setCardOpen(true);
      return;
    }
    setOpen(true);
  }

  function closeForm() {
    if (!open || closing) return;
    playUiSound('close');
    setClosing(true);
    setOpen(false);

    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setClosing(false);
      focusTrigger();
    }, variant === 'content' ? 300 : 620);
  }

  function handleSuccess(result: WaitlistSuccess, details: { name: string; email: string }) {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const saved = saveWaitlistState(result, details.name, details.email);
    setJoined(saved);
    setClosing(false);
    setOpen(false);
    setCardOpen(true);
    playUiSound('success');
    window.setTimeout(() => playUiSound('success'), 420);
    window.dispatchEvent(
      new CustomEvent('shelf:waitlist-joined', {
        detail: { position: result.position, referralCode: result.referralCode, alreadyJoined: result.alreadyJoined === true },
      }),
    );
  }

  function closeCard() {
    playUiSound('close');
    setCardOpen(false);
    focusTrigger();
  }

  const rootClassName = [styles.experience, 'waitlist-signup', className].filter(Boolean).join(' ');

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      data-open={open || undefined}
      data-closing={closing || undefined}
      data-variant={variant}
      data-joined={joined ? true : undefined}
    >
      <div ref={copyRef} className={styles.copy}>
        {children}
        <div ref={triggerRef} className={styles.ctaRow}>
          <BookDemoButton
            href="#waitlist"
            size={20}
            role="button"
            aria-haspopup={joined ? 'dialog' : undefined}
            aria-expanded={joined ? undefined : open}
            aria-controls={!joined && open ? id : undefined}
            onClick={(event) => {
              event.preventDefault();
              openExperience();
            }}
          >
            {joined ? 'View my spot' : 'Join waitlist'}
          </BookDemoButton>
          <WaitlistProof
            joined={Boolean(joined)}
            hideLabel={hideProofLabel}
            hideFaces={hideFaces}
            className={styles.proof}
          />
        </div>
      </div>

      {(open || closing) && (
        <div className={styles.panel} data-variant={variant}>
          {variant === 'hero' && (
            <div className={styles.mobileStickers} aria-hidden="true">
              <img className={styles.stickerFlower} src="/svg/flower.svg" alt="" draggable={false} />
              <img className={styles.stickerSmile} src="/svg/smile%20sticker.svg" alt="" draggable={false} />
              <img className={styles.stickerCassette} src="/svg/cassete.svg" alt="" draggable={false} />
              <img className={styles.stickerCalculator} src="/svg/calculator.svg" alt="" draggable={false} />
              <img className={styles.stickerPolaroid} src="/svg/polaroid.svg" alt="" draggable={false} />
              <img className={styles.stickerBlueFlower} src="/svg/blue%20flower.svg" alt="" draggable={false} />
            </div>
          )}
          <WaitlistForm id={id} onSuccess={handleSuccess} onCancel={closeForm} />
        </div>
      )}

      {mounted && joined && createPortal(
        <ShareCardModal
          open={cardOpen}
          position={joined.position}
          shareUrl={joined.referralUrl}
          shareText={`I just joined the shelf waitlist. I’m #${joined.position}.`}
          onClose={closeCard}
          onShared={(method) => {
            playUiSound('success');
            window.dispatchEvent(
              new CustomEvent('shelf:waitlist-shared', {
                detail: { method, position: joined.position, referralCode: joined.referralCode },
              }),
            );
          }}
        />,
        document.body,
      )}
    </div>
  );
}
