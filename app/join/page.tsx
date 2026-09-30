import { PageShell } from '@/components/site-shell';
import WaitlistForm from '@/components/WaitlistForm';

export default function JoinPage() {
  return (
    <PageShell>
      <section className="simple-page content-width join-page">
        <p className="eyebrow">Early access</p>
        <h1>Join the waitlist.</h1>
        <p>Be among the first to try Shelf and keep the things that make up your life close at hand.</p>
        <WaitlistForm />
      </section>
    </PageShell>
  );
}
