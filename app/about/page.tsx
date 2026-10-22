import ContentPage from '../../components/ContentPage';
import WaitlistSignup from '../../components/WaitlistSignup';
import FooterLinks from '../../components/FooterLinks';

export const metadata = { title: 'About Shelf', description: 'The thinking behind Shelf and the context it keeps.' };

export default function AboutPage() {
  return (
    <ContentPage
      className="about-content"
      visual="/right_visual_about.jpg"
      visualAlt="Shelf about visual: taking a break above a corporate drop ceiling"
    >
      <p className="page-eyebrow">About</p>
      <h1>Context that stays with you</h1>
      <p className="page-lead">Shelf is for the half-finished thoughts, saved tabs, screenshots, and quiet ideas you don’t want to lose — organized the way you actually think.</p>

      <section className="content-section">
        <h2>What we’re building</h2>
        <p>Most tools force you to file things away and hope you’ll remember where they went. Shelf flips that: you capture freely, then find anything when it matters — through collections, context, and search that feel more like memory than a filing cabinet.</p>
        <p>Notes, links, photos, files, and fleeting moments live together on your shelf. Structure adapts to how you think, not the other way around.</p>
      </section>

      <section className="content-section">
        <h2>Who’s behind it</h2>
        <p>Shelf is built by Credes Techlabs — a small team obsessed with the messy middle of personal knowledge: the stuff between “I’ll save this later” and “where did I put that?”</p>
      </section>

      <section className="content-section">
        <h2>Where we are</h2>
        <p>We’re in early access. Join the waitlist to be first in line when Shelf opens up on iOS, web, and Mac.</p>
        <WaitlistSignup id="about-waitlist" className="content-waitlist" />
      </section>
      <FooterLinks />
    </ContentPage>
  );
}
