export const dynamic = 'force-dynamic';
import styles from './contact.module.css';
import ContactForm from './ContactForm';

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>We&apos;d love to hear from you</p>
      </header>

      <div className={styles.content}>
        <div className={styles.contactGrid}>
          <div className={styles.contactInfo}>
            <h2 className={styles.sectionTitle}>Get in Touch</h2>
            <p className={styles.paragraph}>
              Have questions or feedback? Reach out to us using the information below or fill out 
              the contact form.
            </p>

            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <div className={styles.icon}>📍</div>
                <div>
                  <h3 className={styles.detailTitle}>Address</h3>
                  <p className={styles.detailText}>123 Business Street<br />City, State 12345</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.icon}>📧</div>
                <div>
                  <h3 className={styles.detailTitle}>Email</h3>
                  <p className={styles.detailText}>
                    <a href="mailto:info@example.com" className={styles.link}>info@example.com</a>
                  </p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.icon}>📱</div>
                <div>
                  <h3 className={styles.detailTitle}>Phone</h3>
                  <p className={styles.detailText}>(123) 456-7890</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.icon}>⏰</div>
                <div>
                  <h3 className={styles.detailTitle}>Business Hours</h3>
                  <p className={styles.detailText}>
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contactForm}>
            <h2 className={styles.sectionTitle}>Send Us a Message</h2>
            <p className={styles.paragraph}>
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>
            {/* Client component for form interactivity */}
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}