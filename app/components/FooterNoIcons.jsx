import Link from 'next/link';
import styles from './Footer.module.css';

export default function FooterNoIcons() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.companyInfo}>
            <h2 className={styles.logo}>
              <Link href="/" className={styles.logoLink}>
                YourBrand
              </Link>
            </h2>
            <p className={styles.companyDescription}>
              Building amazing solutions for everyone.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                Facebook
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                Twitter
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                Instagram
              </a>
            </div>
          </div>

          {/* Links sections remain the same */}
          {/* ... */}
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bottomFooter}>
          <div className={styles.copyright}>
            <p>&copy; {currentYear} YourBrand. All rights reserved.</p>
          </div>
          
          <div className={styles.legalLinks}>
            <Link href="/terms" className={styles.legalLink}>Terms</Link>
            <span className={styles.separator}>•</span>
            <Link href="/privacy" className={styles.legalLink}>Privacy</Link>
            <span className={styles.separator}>•</span>
            <Link href="/contact" className={styles.legalLink}>Contact</Link>
            <span className={styles.separator}>•</span>
            <Link href="/support" className={styles.legalLink}>Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}