import ContentPage from '../../components/ContentPage';

export const metadata = { title: 'Security · Shelf', description: 'How Shelf protects your notes, links, and moments — with care at every layer we control.' };

export default function SecurityPage() {
  return (
    <ContentPage className="security-content">
      <p className="page-eyebrow">Security</p>
      <h1>Protecting your shelf</h1>
      <p className="page-lead">Your notes, links, and moments are personal. We design Shelf so your context stays yours — with care at every layer we control.</p>

      <section className="content-section">
        <h2>Our approach</h2>
        <p>While Shelf is in early access, we focus on the fundamentals: encrypted connections in transit, least-privilege access to production systems, and careful handling of waitlist and account data.</p>
        <ul>
          <li>HTTPS everywhere for the marketing site and future product surfaces</li>
          <li>Access to customer data limited to people who need it to operate the service</li>
          <li>Dependencies and infrastructure reviewed as we ship toward launch</li>
        </ul>
      </section>

      <section className="content-section">
        <h2>What you can expect at launch</h2>
        <p>As Shelf rolls out on iOS, web, and Mac, we’ll publish clearer detail on authentication, device sync, and how content is stored. This page will grow with the product — not stay a placeholder.</p>
      </section>

      <section className="content-section">
        <h2>Report a vulnerability</h2>
        <p>If you believe you’ve found a security issue, please email <a href="mailto:security@shelf.app">security@shelf.app</a> with enough detail for us to reproduce it. Please don’t publicly disclose the issue until we’ve had a reasonable chance to investigate and fix it.</p>
      </section>

      <section className="content-section">
        <p>General questions? Visit <a href="/contact">Contact</a>.</p>
      </section>
    </ContentPage>
  );
}
