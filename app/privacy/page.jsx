import styles from './privacy.module.css';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>Effective date: {new Date().toLocaleDateString()}</p>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
          <p className={styles.paragraph}>
            We collect several different types of information for various purposes to provide and 
            improve our service to you.
          </p>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Personal Data</h3>
            <p className={styles.infoText}>
              While using our service, we may ask you to provide us with certain personally 
              identifiable information that can be used to contact or identify you.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Use of Data</h2>
          <p className={styles.paragraph}>
            We use the collected data for various purposes:
          </p>
          <ol className={styles.orderedList}>
            <li className={styles.listItem}>To provide and maintain our service</li>
            <li className={styles.listItem}>To notify you about changes to our service</li>
            <li className={styles.listItem}>To allow you to participate in interactive features</li>
            <li className={styles.listItem}>To provide customer support</li>
            <li className={styles.listItem}>To gather analysis or valuable information</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Data Security</h2>
          <p className={styles.paragraph}>
            The security of your data is important to us, but remember that no method of transmission 
            over the Internet or method of electronic storage is 100% secure.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Changes to This Policy</h2>
          <p className={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the &quot;effective date&quot; at the top.
          </p>
        </section>
      </main>
    </div>
  );
}