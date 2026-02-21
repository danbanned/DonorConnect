import Container from './ui/Container';
import Button from './ui/Button';
import styles from './Hero.module.css';

const badges = ['Capterra', 'G2', 'Trustpilot', 'Software Advice'];

export default function Hero() {
  return (
    <section id="solution" className={styles.hero}>
      <Container>
        <h1 className={styles.title}>The Solution: DonorConnect</h1>
        <p className={styles.subtitle}>
          DonorConnect transforms donor management from a data-entry chore into a relationship-building tool.
          We sync with systems like Salesforce and Bloomerang to create one friendly view of every donor.
        </p>
        <div className={styles.actions}>
          <Button href="#features">EXPLORE FEATURES</Button>
          <Button href="#why-donorconnect" variant="secondary">WHY DONORCONNECT</Button>
        </div>
        <div className={styles.badges}>
          {badges.map((badge) => (
            <span key={badge} className={styles.badge}>{badge}</span>
          ))}
        </div>
      </Container>
    </section>
  );
}
