'use client';

import { useState } from 'react';
import styles from './ActivityCard.module.css';

export default function ActivityCard({ activity }) {
  const [expanded, setExpanded] = useState(false);

  const formatAmount = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getActivityColor = (type) => {
  switch (type) {
    case 'DONATION':
      return '#059669'; // Green
    case 'MEETING':
      return '#2563eb'; // Blue
    case 'COMMUNICATION':
      return '#7c3aed'; // Purple
    case 'NOTE':
      return '#d97706'; // Amber
    case 'STATUS':
      return '#dc2626'; // Red
    default:
      return '#475569'; // Slate
  }
};

  return (
    <div 
      className={styles.card}
      style={{ 
        borderLeft: `4px solid ${getActivityColor(activity.type)}`,
        borderTopLeftRadius: '0',
        borderBottomLeftRadius: '0',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconContainer}>
          <span className={styles.icon}>{activity.icon}</span>
          <div className={styles.typeBadge} style={{ backgroundColor: getActivityColor(activity.type) }}>
            {activity.type}
          </div>
        </div>
        
        <div className={styles.activityInfo}>
          <div className={styles.donorInfo}>
            <h4 className={styles.donorName}>{activity.donor}</h4>
            <p className={styles.action}>{activity.displayAction}</p>
          </div>
          
          {activity.description && (
            <p className={styles.description}>{activity.description}</p>
          )}
        </div>
        
        <div className={styles.metaInfo}>
          <span className={styles.time}>{activity.time}</span>
          {activity.amount && (
            <span className={styles.amount}>{formatAmount(activity.amount)}</span>
          )}
          <button 
            className={styles.expandButton}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && activity.rawData && (
        <div className={styles.details}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Activity ID:</span>
              <span className={styles.detailValue}>{activity.id}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Created:</span>
              <span className={styles.detailValue}>
                {new Date(activity.createdAt).toLocaleString()}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Donor ID:</span>
              <span className={styles.detailValue}>{activity.donorId}</span>
            </div>
            {activity.rawData.campaign && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Campaign:</span>
                <span className={styles.detailValue}>{activity.rawData.campaign.name}</span>
              </div>
            )}
          </div>
          
          {activity.rawData.metadata && Object.keys(activity.rawData.metadata).length > 0 && (
            <div className={styles.metadata}>
              <h5 className={styles.metadataTitle}>Additional Information</h5>
              <pre className={styles.metadataContent}>
                {JSON.stringify(activity.rawData.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}