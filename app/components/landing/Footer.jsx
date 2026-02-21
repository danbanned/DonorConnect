import Link from 'next/link';
import Container from './ui/Container';
import Button from './ui/Button';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div>
            <p className={styles.logo}>DONORCONNECT</p>
            <p className={styles.tagline}>Intelligent Fundraising</p>
          </div>
          <div className={styles.authButtons}>
            <Button href="/login">SIGN UP FREE</Button>
            <Button href="/login" variant="secondary">LOG IN</Button>
          </div>
        </div>

        <div className={styles.columns}>
          <div>
            <h4>PRODUCT</h4>
            <Link href="#solution">Tour</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#faq">FAQ</Link>
          </div>
          <div>
            <h4>FEATURES</h4>
            <Link href="#human-first-profiles">Donor Database</Link>
            <Link href="#helpful-automation">Smart Automate</Link>
            <Link href="#visual-dashboards">Reports</Link>
          </div>
          <div>
            <h4>RESOURCES</h4>
            <Link href="/blog">Blog</Link>
            <Link href="/docs">Guides</Link>
            <Link href="/status">Support</Link>
          </div>
        </div>

        <div className={styles.social}>[in] [🐦] [▶️] [✉️]</div>

        <div className={styles.legal}>
          <p>© 2026 DonorConnect. All rights reserved.</p>
          <p>Terms | Privacy | Security</p>
        </div>

        <p className={styles.landAck}>
          🌍 DonorConnect proudly acknowledges the lands upon which we gather and work are the traditional,
          ancestral, and unceded territories of the xʷməθkʷəy̓əm (Musqueam), Skwxwú7mesh (Squamish), and
          Səl̓il̓wətaɬ (Tsleil-Waututh) Nations.
        </p>
      </Container>
    </footer>
  );
}
