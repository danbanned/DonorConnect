import Container from './ui/Container';
import styles from './Metrics.module.css';

const stats = [
  { value: '35%', label: 'Average Time Saved on Admin' },
  { value: '50M+', label: 'Dollars Processed via Platform' },
  { value: '99%', label: 'Customer Satisfaction Rate' }
];

export default function Metrics() {
  return (
    <section id="visual-dashboards" className={styles.strip}>
      <Container className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.item}>
            <div className={styles.value}>{stat.value}</div>
            <p className={styles.label}>{stat.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
