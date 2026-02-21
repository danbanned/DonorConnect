import Container from './ui/Container';
import SectionHeading from './ui/SectionHeading';
import styles from './FeatureGrid.module.css';

const features = [
  { id: 'human-first-profiles', icon: '👤', title: 'Human-First Donor Profiles', text: 'See donation history, interests, communication preferences, and relationship stage in one friendly view.' },
  { id: 'actionable-insights', icon: '💡', title: 'Actionable Donor Insights', text: 'Get AI suggestions for best outreach timing, ask amounts, and next best actions.' },
  { id: 'smart-communication', icon: '📧', title: 'Smart Communication Engine', text: 'Create personalized campaigns, track engagement, and auto-log interactions to each donor record.' },
  { id: 'visual-dashboards', icon: '📊', title: 'Simple, Visual Dashboards', text: 'Monitor campaign progress, donor engagement trends, and data quality at a glance.' },
  { id: 'helpful-automation', icon: '⏱️', title: 'Automation That Actually Helps', text: 'Automate donor briefs, daily task summaries, and major gift or check-in alerts.' },
  { id: 'built-for-real-life', icon: '🔒', title: 'Built for Real Life', text: 'Grandma-simple UX, cross-device access, and automatic duplicate/data issue flags.' }
];

export default function FeatureGrid() {
  return (
    <section id="features" className={styles.section}>
      <Container>
        <SectionHeading
          title="Key Features"
          description="Everything your team needs to build stronger donor relationships and sustainable funding."
        />
        <div className={styles.grid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.card} id={feature.id}>
              <div className={styles.icon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <a href="#solution" className={styles.link}>Learn more →</a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
