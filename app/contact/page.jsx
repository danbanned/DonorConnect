import styles from './contact.module.css';

export default function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    alert('Thank you for your message! We will get back to you soon.');
  };

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
            </div>
          </div>

          <div className={styles.contactForm}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Name</label>
                <input
                  type="text"
                  id="name"
                  className={styles.input}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  placeholder="Your email address"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.label}>Subject</label>
                <input
                  type="text"
                  id="subject"
                  className={styles.input}
                  placeholder="What is this regarding?"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Message</label>
                <textarea
                  id="message"
                  className={styles.textarea}
                  rows="5"
                  placeholder="Your message..."
                  required
                ></textarea>
              </div>

              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}