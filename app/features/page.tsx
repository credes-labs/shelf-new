import ContentPage from '../../components/ContentPage';
import WaitlistSignup from '../../components/WaitlistSignup';

export const metadata = { title: 'Features · Shelf', description: 'Capture freely, organize lightly, and find the right context with Shelf.' };

export default function FeaturesPage() {
  return (
    <ContentPage
      className="features-content"
      visual="/right_visual_features.jpg"
      visualAlt="Shelf features visual: staying organized while the office burns"
    >
      <p className="page-eyebrow">Features</p>
      <h1>Keep it. Find it. Use it.</h1>
      <p className="page-lead">Shelf is a scrapbook for your digital life — capture freely, organize lightly, and pull the right context when you need it.</p>

      <section className="content-section">
        <h2>Organize</h2>
        <p>Build collections that match how your mind works — eureka moments, ongoing context, and curated shelves — without rigid folders getting in the way.</p>
        <ul>
          <li>Save notes, links, screenshots, files, and moments in one place</li>
          <li>Group related captures into collections that grow with you</li>
          <li>Keep structure flexible so nothing feels buried</li>
        </ul>
      </section>

      <section className="content-section">
        <h2>Find</h2>
        <p>Search and browse across everything you’ve saved — photos, notes, web links, music, and files — so the right piece of context shows up when it matters.</p>
        <ul>
          <li>Filter by media type when you know what you’re looking for</li>
          <li>Jump back into collections without digging through apps</li>
          <li>Revisit ideas the moment they become useful again</li>
        </ul>
      </section>

      <section className="content-section">
        <h2>Coming with early access</h2>
        <p>Native experiences for iOS, web, and Mac are on the way. Join the waitlist to get notified when your platform opens up.</p>
        <WaitlistSignup id="features-waitlist" className="content-waitlist" variant="content" />
      </section>
    </ContentPage>
  );
}
