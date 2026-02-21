import Container from './ui/Container';
import Button from './ui/Button';
import styles from './CaseStudy.module.css';

export default function CaseStudy() {
  return (
    <section id="why-donorconnect" className={styles.section}>
      <Container className={styles.grid}>
        <div id="case-study" className={styles.chartCard}>
          <div className={styles.barWrap}>
            <div className={styles.barOne}></div>
            <div className={styles.barTwo}></div>
          </div>
          <p>Monthly Donor Growth: +28%</p>
        </div>
        <div className={styles.copy}>
          <h2>Why DonorConnect?</h2>
          <p>
            DonorConnect doesn&apos;t just manage data. It helps your team remember people.
            We turn your CRM from a static record into a proactive decision assistant for stronger, more authentic donor relationships.
          </p>
          <Button href="#case-study" variant="secondary">SEE A REAL OUTCOME ➔</Button>
        </div>
      </Container>
    </section>
  );
}
