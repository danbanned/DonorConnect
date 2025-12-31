'use client';

import Link from 'next/link';
import styles from './Footer.module.css';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          {/* Company Info */}
          <div className={styles.companyInfo}>
            <h2 className={styles.logo}>
              <Link href="/" className={styles.logoLink}>
                DonorConnect
              </Link>
            </h2>
            <p className={styles.companyDescription}>
              Building amazing solutions for everyone. Join us on our journey to make the world better through technology.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <FaFacebook className={styles.socialIcon} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <FaTwitter className={styles.socialIcon} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <FaInstagram className={styles.socialIcon} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <FaLinkedin className={styles.socialIcon} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <FaGithub className={styles.socialIcon} />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linksList}>
              <li className={styles.listItem}>
                <Link href="/" className={styles.link}>Home</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/about" className={styles.link}>About Us</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/services" className={styles.link}>Services</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/pricing" className={styles.link}>Pricing</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/blog" className={styles.link}>Blog</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Resources</h3>
            <ul className={styles.linksList}>
              <li className={styles.listItem}>
                <Link href="/support" className={styles.link}>Support Center</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/docs" className={styles.link}>Documentation</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/guides" className={styles.link}>Guides</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/status" className={styles.link}>System Status</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/community" className={styles.link}>Community</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Legal & Contact</h3>
            <ul className={styles.linksList}>
              <li className={styles.listItem}>
                <Link href="/contact" className={styles.link}>Contact Us</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/terms" className={styles.link}>Terms & Conditions</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/cookies" className={styles.link}>Cookie Policy</Link>
              </li>
              <li className={styles.listItem}>
                <Link href="/sitemap" className={styles.link}>Sitemap</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletterSection}>
            <h3 className={styles.sectionTitle}>Stay Updated</h3>
            <p className={styles.newsletterDescription}>
              Subscribe to our newsletter for the latest updates and news.
            </p>
            <form className={styles.newsletterForm}>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  placeholder="Your email address"
                  className={styles.emailInput}
                  required
                />
                <button type="submit" className={styles.subscribeButton}>
                  Subscribe
                </button>
              </div>
              <p className={styles.newsletterNote}>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Bottom Footer */}
        <div className={styles.bottomFooter}>
          <div className={styles.copyright}>
            <p>&copy; {currentYear} YourBrand. All rights reserved.</p>
          </div>
          
          <div className={styles.legalLinks}>
            <Link href="/terms" className={styles.legalLink}>Terms</Link>
            <span className={styles.separator}>•</span>
            <Link href="/privacy" className={styles.legalLink}>Privacy</Link>
            <span className={styles.separator}>•</span>
            <Link href="/cookies" className={styles.legalLink}>Cookies</Link>
            <span className={styles.separator}>•</span>
            <Link href="/security" className={styles.legalLink}>Security</Link>
          </div>
          
          <div className={styles.backToTop}>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={styles.backToTopButton}
            >
              Back to Top ↑
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <strong>Email:</strong>{' '}
            <a href="mailto:info@example.com" className={styles.contactLink}>
              info@example.com
            </a>
          </div>
          <div className={styles.contactItem}>
            <strong>Phone:</strong>{' '}
            <a href="tel:+1234567890" className={styles.contactLink}>
              (123) 456-7890
            </a>
          </div>
          <div className={styles.contactItem}>
            <strong>Address:</strong> 123 Business Street, City, State 12345
          </div>
        </div>
      </div>
    </footer>
  );
}