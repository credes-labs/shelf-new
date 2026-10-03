import { SOCIALS, SocialGlyph, socialLabel } from './SocialIcons';
import styles from './FooterLinks.module.css';

/**
 * Footer hyperlinks for pages without a footer of their own.
 * Rendered only on desktop — mobile shows the full BrickFooter below.
 */
export default function FooterLinks() {
  return (
    <div className={styles.wrap}>
      <nav className={styles.socials} aria-label="Social links">
        {SOCIALS.map((name) => (
          <a key={name} href={`#${name}`} aria-label={socialLabel(name)}>
            <SocialGlyph name={name} />
          </a>
        ))}
      </nav>
      <p className={styles.copyright}>© Credes Techlabs 2026</p>
      <div className={styles.links}>
        <div>
          <span>Company</span>
          <a href="/about">About us</a>
          <a href="/contact">Contact</a>
          <a href="/security">Security</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="/terms">Terms and Conditions</a>
        </div>
        <div>
          <span>Download</span>
          <a href="#ios">iOS</a>
          <a href="#web">Web</a>
          <a href="#macos">Mac os</a>
        </div>
      </div>
    </div>
  );
}
