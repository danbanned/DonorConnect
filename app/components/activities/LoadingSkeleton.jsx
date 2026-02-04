import styles from './LoadingSkeleton.module.css';

export default function LoadingSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.headerSkeleton}>
        <div className={styles.titleSkeleton}></div>
        <div className={styles.subtitleSkeleton}></div>
      </div>
      <div className={styles.gridSkeleton}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.cardSkeleton}>
            <div className={styles.cardIcon}></div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}></div>
              <div className={styles.cardSubtitle}></div>
            </div>
            <div className={styles.cardMeta}></div>
          </div>
        ))}
      </div>
    </div>
  );
}