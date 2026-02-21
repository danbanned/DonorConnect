import Container from './ui/Container';
import Button from './ui/Button';
import styles from './DonationWidget.module.css';

const amounts = ['$25', '$50', '$100', '$250', 'Custom'];

export default function DonationWidget() {
  return (
    <section id="pricing" className={styles.section}>
      <Container className={styles.wrap}>
        <h2>Make a Difference Today</h2>
        <div className={styles.tabs}>
          <button className={styles.active}>Monthly</button>
          <button>One-Time</button>
        </div>
        <div className={styles.amounts}>
          {amounts.map((amount, idx) => (
            <button key={amount} className={idx === 1 ? styles.activeAmount : ''}>{amount}</button>
          ))}
        </div>
        <div className={styles.smartAsk}>
          <strong>🤖 SMART ASK</strong>
          <p>Based on past giving, this donor may give $50-$100.</p>
        </div>
        <Button href="#contact" fullWidth>TALK TO OUR TEAM</Button>
      </Container>
    </section>
  );
}
