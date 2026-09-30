'use client';

import Image from 'next/image';
import Link from 'next/link';

export function FooterSection() {
  return (
    <footer className="shelf-orange-footer" id="waitlist-anchor" role="contentinfo">
      <div className="footer-top-row">
        {/* Brand Side */}
        <div className="footer-brand-side">
          <Link href="/" aria-label="Shelf home">
            <Image
              src="/svg/shelf-logo.svg"
              alt="shelf"
              width={124}
              height={40}
              className="footer-logo-white"
              unoptimized
            />
          </Link>

          {/* Social Icons row matching Image 4 */}
          <div className="footer-socials-row">
            <Image
              src="/svg/socials.svg"
              alt="Social links"
              width={160}
              height={22}
              unoptimized
            />
          </div>

          <div style={{ fontSize: '13px', opacity: 0.85 }}>
            © Credes Techlabs 2026
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="footer-columns-side">
          {/* Company */}
          <div className="footer-nav-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About us</Link></li>
              <li><a href="mailto:hello@shelf.app">Contact</a></li>
              <li><Link href="/about">Security</Link></li>
              <li><Link href="/about">Privacy Policy</Link></li>
              <li><Link href="/about">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Download */}
          <div className="footer-nav-col">
            <h4>Download</h4>
            <ul>
              <li><a href="#waitlist-anchor">iOS</a></li>
              <li><a href="#waitlist-anchor">Web</a></li>
              <li><a href="#waitlist-anchor">Mac os</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Giant Wordmark & Physical Sticker Scatter Layer */}
      <div className="footer-wordmark-scatter-stage">
        {/* Massive 'shelf' wordmark text */}
        <div className="giant-footer-shelf-text" aria-hidden="true">
          shelf
        </div>

        {/* Sticker Scatter overlay */}
        <div className="stickers-scatter-overlay" aria-hidden="true">
          {/* Smiley */}
          <div className="scatter-item" style={{ left: '4%', bottom: '28px', transform: 'rotate(-12deg)' }}>
            <Image src="/stickers/smile.svg" alt="" width={96} height={104} unoptimized />
          </div>

          {/* Pink Stamp */}
          <div className="scatter-item" style={{ left: '12%', bottom: '48px', transform: 'rotate(8deg)' }}>
            <Image src="/stickers/pinkstamp.svg" alt="" width={80} height={90} unoptimized />
          </div>

          {/* White flower */}
          <div className="scatter-item" style={{ left: '20%', bottom: '32px', transform: 'rotate(-6deg)' }}>
            <Image src="/stickers/flower.svg" alt="" width={86} height={96} unoptimized />
          </div>

          {/* Coin */}
          <div className="scatter-item" style={{ left: '38%', bottom: '40px', transform: 'rotate(10deg)' }}>
            <Image src="/stickers/coin.svg" alt="" width={94} height={94} unoptimized />
          </div>

          {/* Orange ticket */}
          <div className="scatter-item" style={{ left: '56%', bottom: '52px', transform: 'rotate(24deg)' }}>
            <Image src="/stickers/orangetickect.svg" alt="" width={90} height={90} unoptimized />
          </div>

          {/* Polaroid */}
          <div className="scatter-item" style={{ right: '12%', bottom: '36px', transform: 'rotate(14deg)' }}>
            <Image src="/stickers/polaroid.svg" alt="" width={98} height={126} unoptimized />
          </div>

          {/* Stamp badge */}
          <div className="scatter-item" style={{ right: '4%', bottom: '42px', transform: 'rotate(-8deg)' }}>
            <Image src="/stickers/stamp.svg" alt="" width={100} height={100} unoptimized />
          </div>
        </div>
      </div>
    </footer>
  );
}
