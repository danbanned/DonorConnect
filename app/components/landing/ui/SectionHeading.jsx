import styles from './SectionHeading.module.css';

export default function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className={styles.headingWrap}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
