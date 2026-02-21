import Container from './ui/Container';
import Button from './ui/Button';
import styles from './MigrationSection.module.css';

const checks = ['Contacts', 'Donation History', 'Recurring Gifts', 'Custom Fields', 'Communication Logs'];

export default function MigrationSection() {
  return (
    <section id="helpful-automation" className={styles.section}>
      <Container className={styles.box}>
        <h2>Automation That Helps Real Fundraisers</h2>
        <p>
          Get automated donor briefs before meetings, task summaries each day, and alerts for major donations
          or donors needing a check-in. Your team spends less time chasing notes and more time building trust.
        </p>
        <ul className={styles.list}>
          {checks.map((item) => <li key={item}>✅ {item}</li>)}
        </ul>
        <Button href="#features">VIEW ALL FEATURE DETAILS ➔</Button>
        <blockquote className={styles.quote}>
          &quot;DonorConnect helps us remember people, not just transactions. Our follow-ups are more personal and more timely.&quot;
          <span className={styles.quoteMeta}>- Development Team, DonorConnect Customer</span>
        </blockquote>
      </Container>
    </section>
  );
}
