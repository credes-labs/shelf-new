import ContentPage from '../../components/ContentPage';

export const metadata = { title: 'Contact Shelf', description: 'Questions about Shelf, the waitlist, partnerships, or press — we’d love to hear from you.' };

export default function ContactPage() {
  return (
    <ContentPage className="contact-content">
      <p className="page-eyebrow">Contact</p>
      <h1>Say hello</h1>
      <p className="page-lead">Questions about Shelf, the waitlist, partnerships, or press — we’d love to hear from you.</p>

      <section className="content-section">
        <h2>Email</h2>
        <p>Reach us at <a href="mailto:hello@shelf.app">hello@shelf.app</a>. We read every message and usually reply within a few business days.</p>
      </section>

      <section className="content-section">
        <h2>Waitlist &amp; product</h2>
        <p>For early access, the fastest path is the waitlist form. If you’re already on it and need to update your details, email us with the address you signed up with.</p>
      </section>

      <section className="content-section">
        <h2>Company</h2>
        <p>Shelf is a product of Credes Techlabs. For security reports, see our <a href="/security">Security</a> page. For legal matters, start with Privacy or <a href="/terms">Terms</a>.</p>
      </section>
    </ContentPage>
  );
}
