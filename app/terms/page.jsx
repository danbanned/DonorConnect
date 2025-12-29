import styles from './terms.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Terms and Conditions</h1>
        <p className={styles.subtitle}>Last updated: {new Date().toLocaleDateString()}</p>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
          <p className={styles.paragraph}>
            By accessing and using this website, you accept and agree to be bound by the terms and 
            provision of this agreement.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Use License</h2>
          <p className={styles.paragraph}>
            Permission is granted to temporarily download one copy of the materials on our website 
            for personal, non-commercial transitory viewing only.
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Modify or copy the materials</li>
            <li className={styles.listItem}>Use the materials for any commercial purpose</li>
            <li className={styles.listItem}>Attempt to reverse engineer any software</li>
            <li className={styles.listItem}>Transfer the materials to another person</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Disclaimer</h2>
          <p className={styles.paragraph}>
            The materials on our website are provided on an &apos;as is&apos; basis. We make no warranties, 
            expressed or implied, and hereby disclaim and negate all other warranties including, without 
            limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, 
            or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Contact Information</h2>
          <p className={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
            <br />
            <a href="mailto:legal@example.com" className={styles.link}>legal@example.com</a>
          </p>
        </section>
      </main>
    </div>
  );
}