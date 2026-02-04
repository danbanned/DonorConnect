import styles from './ActivitiesStats.module.css';

export default function ActivitiesStats({ stats }) {
  if (!stats) return null;

  const total = stats.totalActivities || 0;
  const byType = stats.byType || {};
 const typeColors = {
  DONATION: '#059669',
  MEETING: '#2563eb',
  COMMUNICATION: '#7c3aed',
  ACTIVITY: '#d97706',
};

  const getPercentage = (count) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Activity Overview</h3>
      
      <div className={styles.totalCard}>
        <div className={styles.totalIcon}>📊</div>
        <div>
          <div className={styles.totalLabel}>Total Activities</div>
          <div className={styles.totalValue}>{total}</div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} className={styles.statCard}>
            <div 
              className={styles.statIcon}
              style={{ backgroundColor: typeColors[type] || '#6B7280' }}
            >
              {type === 'DONATION' && '💰'}
              {type === 'MEETING' && '📅'}
              {type === 'COMMUNICATION' && '📧'}
              {type === 'ACTIVITY' && '📝'}
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>{type}</div>
              <div className={styles.statValue}>{count}</div>
              <div className={styles.statBar}>
                <div 
                  className={styles.statBarFill}
                  style={{ 
                    width: `${getPercentage(count)}%`,
                    backgroundColor: typeColors[type] || '#6B7280'
                  }}
                />
              </div>
              <div className={styles.statPercentage}>{getPercentage(count)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}