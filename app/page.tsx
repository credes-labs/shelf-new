'use client';

import { FormEvent, useState } from 'react';
import NextImage from 'next/image';
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  FileText,
  Image as PhotoIcon,
  Link2,
  Music2,
  NotebookPen,
  Search,
} from 'lucide-react';
import { PageShell } from '@/components/site-shell';
import EditableIntro from '@/components/EditableIntro';
import HeroTabs from '@/components/HeroTabs';
import Link from 'next/link';
import WaitlistCard from '@/components/WaitlistCard';

type FormValues = { name: string; email: string };

const mediaItems = [
  { label: 'Audio', title: 'voice memo', color: 'pink', icon: Music2 },
  { label: 'File', title: 'visa PDF scan', color: 'yellow', icon: FileText },
  { label: 'Note', title: 'hospital visit', color: 'coral', icon: NotebookPen },
  { label: 'Link', title: 'Mt. Fuji trail map', color: 'blue', icon: Link2 },
  { label: 'Photo', title: 'FamilyMart receipt', color: 'green', icon: PhotoIcon },
  { label: 'Note', title: 'souvenir shop list', color: 'peach', icon: NotebookPen },
];

function WaitlistForm() {
  const [values, setValues] = useState<FormValues>({ name: '', email: '' });
  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.name.trim() || !values.email.trim()) return;
    let number = 2998;
    try {
      const stored = Number(window.localStorage.getItem('shelf-waitlist-next-id'));
      number = Number.isFinite(stored) && stored >= 2998 ? stored + 1 : 2998;
      window.localStorage.setItem('shelf-waitlist-next-id', String(number));
    } catch {
      number = Math.floor(1000 + Math.random() * 9000);
    }
    setWaitlistId(`#${String(number).padStart(4, '0')}`);
  }
  if (waitlistId) return <WaitlistCard id={waitlistId} name={values.name.trim()} />;
  return <form className="waitlist-form" onSubmit={handleSubmit}><label><span>Name <b>*</b></span><input required value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} placeholder="Fill your full name" /></label><label><span>Email <b>*</b></span><input required type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} placeholder="Fill your email address" /></label><div className="split-fields"><label><span>Country</span><button type="button" className="select-field">IN&nbsp; India <ChevronDown size={16} /></button></label><label><span>Phone number</span><input placeholder="+91  Phone number" /></label></div><label className="check-row"><input type="checkbox" /><span>Agree to email notifications about blogs and updates.</span></label><label className="check-row"><input type="checkbox" required /><span>T&amp;C read</span></label><button className="dark-button form-submit" type="submit">Join waitlist <ArrowRight size={17} /></button></form>;
}

function ShelfCards() {
  return <div className="shelf-scene" aria-label="A shelf of saved items"><div className="search-pill"><Search size={16} /> Japan tour hospital</div><div className="floating-pill floating-pill-one"><Search size={14} /> Photos from Osaka</div><div className="cards-row">{mediaItems.map(({ label, title, color, icon: Icon }) => <div className={`media-card card-${color}`} key={title}><div className="media-card-head"><Icon size={15} /><small>{label}</small></div><strong>{title}</strong><span className="linked-dot" /> linked in Shelf</div>)}</div><div className="wood-shelf" /></div>;
}

export default function Home() {
  return <PageShell>
    <section className="hero content-width" id="about">
      <HeroTabs />
      <p className="eyebrow">Your personal context keeper</p>
      <EditableIntro />
      <p className="hero-copy">Shelf helps you save notes, links, screenshots, ideas, and moments into organized collections you can revisit any time.</p>
      <a href="#join" className="dark-button hero-button">Join waitlist <ArrowRight size={17} /></a>
      <div className="hero-art">
        <span className="sticker sticker-clock"><Clock3 size={48} /></span>
        <span className="sticker sticker-note">ideas<br />to revisit</span>
        <NextImage className="phone-artwork" src="/svg/phone.svg" alt="Shelf app on a phone" width={558} height={843} unoptimized />
        <span className="sticker sticker-ticket">SPECIAL<br /><b>$ 2.00</b></span>
      </div>
    </section>
    <section className="find-section content-width" id="features">
      <span className="section-tag">Find</span>
      <h2>Find anything, right<br />when it matters</h2>
      <p className="section-copy">Your digital memory, beautifully organized and ready when you need it.</p>
      <ShelfCards />
    </section>
    <section className="join-section content-width" id="join">
      <div className="join-collage"><div className="collage-circle circle-blue" /><div className="collage-circle circle-orange" /><div className="collage-circle circle-yellow" /><div className="collage-note">remember<br />the little things</div><div className="collage-receipt">FamilyMart<br /><small>thank you</small></div><div className="collage-key">◆</div></div>
      <div className="join-content"><span className="section-tag">Stop wasting time</span><h2>Join us to organize your life <em>your way</em></h2><p>Get early access to Shelf and be the first to turn your scattered moments into something you can find again.</p><WaitlistForm /></div>
    </section>
    <section className="blog-strip content-width" id="blog"><div><span className="section-tag">The Shelf journal</span><h2>Small things worth<br /><em>remembering.</em></h2></div><Link href="/blog" className="outline-button">Read the journal <ArrowRight size={17} /></Link></section>
  </PageShell>;
}
