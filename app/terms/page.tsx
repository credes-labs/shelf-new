import ContentPage from '../../components/ContentPage';

export const metadata = { title: 'Terms and Conditions · Shelf', description: 'The terms for using the Shelf website and joining the waitlist.' };

export default function TermsPage() {
  return (
    <ContentPage className="terms-content">
      <p className="page-eyebrow">Terms</p>
      <h1>Terms and Conditions</h1>
      <p className="page-date">Last updated July 22, 2026.</p>
      <p className="page-lead">By using the Shelf website or joining the waitlist, you agree to these terms with Credes Techlabs (“we”, “us”).</p>

      <section className="content-section">
        <h2>Using the site</h2>
        <p>You may browse this website and join the waitlist for personal, non-commercial purposes. Don’t misuse the site — including attempting to disrupt services, scrape in abusive ways, or submit false information.</p>
      </section>

      <section className="content-section">
        <h2>Waitlist</h2>
        <p>Joining the waitlist does not guarantee access, a launch date, or a specific feature set. We’ll use the contact details you provide to communicate about early access and Shelf updates. You can ask to be removed anytime via <a href="mailto:hello@shelf.app">hello@shelf.app</a>.</p>
      </section>

      <section className="content-section">
        <h2>Content &amp; feedback</h2>
        <p>Blog posts and marketing copy on this site belong to Credes Techlabs unless otherwise noted. If you leave comments or send feedback, you grant us a non-exclusive license to use that material to operate and improve Shelf.</p>
      </section>

      <section className="content-section">
        <h2>Disclaimer</h2>
        <p>The website and waitlist are provided “as is.” During early access we may change, pause, or discontinue features without notice. To the fullest extent allowed by law, Credes Techlabs is not liable for indirect or consequential damages arising from your use of the site.</p>
      </section>

      <section className="content-section">
        <h2>Privacy</h2>
        <p>How we handle personal data is described in our Privacy Policy.</p>
      </section>

      <section className="content-section">
        <h2>Changes</h2>
        <p>We may update these terms as Shelf evolves. The date at the top will reflect the latest version. If you continue using the site after changes, you accept the updated terms.</p>
      </section>

      <section className="content-section">
        <h2>Contact</h2>
        <p>Questions about these terms? <a href="/contact">Contact us</a> or email <a href="mailto:hello@shelf.app">hello@shelf.app</a>.</p>
      </section>
    </ContentPage>
  );
}
