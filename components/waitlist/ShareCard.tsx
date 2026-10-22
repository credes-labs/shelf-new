"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ShareCard.module.css";

export type ShareCardProps = {
  /** Waitlist position, rendered as "#101" */
  position: number;
  /** Headline lines. Each line is staggered horizontally. */
  lines?: string[];
  /** URL shared when the user taps "share" (e.g. a referral link) */
  shareUrl?: string;
  /** Text used in the native share sheet */
  shareText?: string;
  onClose?: () => void;
  onShared?: (method: "native" | "clipboard") => void;
};

const DEFAULT_LINES = ["i won\u2019t", "forget", "things", "anymore"];
// Horizontal offsets (in em) that create the staggered look from the design
const OFFSETS = ["0.62em", "0em", "0.72em", "0.22em"];

function Logo() {
  return (
    <div className={styles.logo} aria-label="shelf">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <path
          d="M17 3 29 10v14L17 31 5 24V10L17 3Z"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M5 10l12 7 12-7M17 17v14" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M11 6.5 23 13.5v5" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
      <span>shelf</span>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.3 10.8 7.4-4.4M8.3 13.2l7.4 4.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function ShareCard({
  position,
  lines = DEFAULT_LINES,
  shareUrl,
  shareText = "I just joined the shelf waitlist.",
  onClose,
  onShared,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = shareUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "shelf", text: shareText, url });
        onShared?.("native");
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onShared?.("clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user cancelled the share sheet: do nothing
    }
  }, [shareUrl, shareText, onShared]);

  return (
    <div className={styles.card} role="dialog" aria-modal="true" aria-label="Your waitlist card">
      <header className={styles.header}>
        <Logo />
        {onClose && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </header>

      <h2 className={styles.headline}>
        {lines.map((line, i) => (
          <span key={i} className={styles.line} style={{ marginLeft: OFFSETS[i % OFFSETS.length] }}>
            {line}
          </span>
        ))}
      </h2>

      <footer className={styles.footer}>
        <span className={styles.position}>#{position}</span>
        <button type="button" className={styles.share} onClick={handleShare}>
          <ShareIcon />
          {copied ? "copied" : "share"}
        </button>
      </footer>
    </div>
  );
}

/** Convenience wrapper: dark backdrop + Esc to close. Render after a successful waitlist signup. */
export function ShareCardModal(props: ShareCardProps & { open: boolean }) {
  const { open, onClose, ...rest } = props;
  const innerRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;

      const root = innerRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusTimer = window.setTimeout(() => {
      const closeButton = innerRef.current?.querySelector<HTMLElement>('button[aria-label="Close"]');
      (closeButton ?? innerRef.current)?.focus();
    }, 40);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        ref={innerRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={styles.modalInner}
      >
        <ShareCard {...rest} onClose={onClose} />
      </div>
    </div>
  );
}

export default ShareCard;
