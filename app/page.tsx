import Image from 'next/image';
import { PageShell } from '@/components/site-shell';

export default function Home() {
  return (
    <PageShell>
      <section className="hero content-width" aria-labelledby="hero-title">
        <div className="hero-copy-block">
          <p className="eyebrow">Your personal context keeper</p>
          <h1 id="hero-title">Keep your context close.</h1>
          <p className="hero-copy">
            Shelf helps you save notes, links, screenshots, ideas, and moments into organized collections you can revisit any time.
          </p>
          <a className="text-link" href="/join">Join the waitlist <span aria-hidden="true">→</span></a>
        </div>
        <div className="hero-art">
          <Image
            className="phone-artwork"
            src="/svg/phone.svg"
            alt="Shelf open on a phone"
            width={558}
            height={843}
            priority
            unoptimized
          />
        </div>
      </section>

    </PageShell>
  );
}
