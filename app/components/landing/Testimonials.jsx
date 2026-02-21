import Container from './ui/Container';
import SectionHeading from './ui/SectionHeading';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    quote: 'DonorConnect transformed how we track donations. The interface is intuitive and our team adopted it immediately.',
    name: 'Sarah Johnson',
    role: 'Executive Director, Local Arts Council'
  },
  {
    quote: 'Finally, a CRM built for how fundraisers actually work. The automation alone saves us 10 hours a week.',
    name: 'David Rodriguez',
    role: 'Development Manager, Youth Mentoring Program'
  },
  {
    quote: 'The reporting tools are incredible. I can show our board exactly where donations are coming from.',
    name: 'Patricia Wong',
    role: 'Director of Development, Community Clinic'
  },
  {
    quote: 'Best decision we made this year. The migration was painless and support is always responsive.',
    name: 'Marcus Taylor',
    role: 'Operations Director, Animal Rescue League'
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className={styles.section}>
      <Container>
        <SectionHeading title="Loved by Modern Fundraising Teams" />
        <div className={styles.grid}>
          {testimonials.map((item) => (
            <article key={item.name} className={styles.card}>
              <p className={styles.stars}>⭐⭐⭐⭐⭐</p>
              <p className={styles.quote}>&quot;{item.quote}&quot;</p>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.role}>{item.role}</p>
              <a href="#faq" className={styles.link}>Read more reviews →</a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
