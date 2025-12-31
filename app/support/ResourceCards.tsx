import styles from './support.module.css';

const resources = [
  {
    id: 1,
    title: 'Documentation',
    description: 'Comprehensive technical documentation and API references',
    icon: '📘',
    link: '/docs',
    color: '#4299e1'
  },
  {
    id: 2,
    title: 'Video Tutorials',
    description: 'Step-by-step video guides and walkthroughs',
    icon: '🎬',
    link: '/tutorials',
    color: '#ed8936'
  },
  {
    id: 3,
    title: 'Community Forum',
    description: 'Connect with other users and share solutions',
    icon: '👥',
    link: '/forum',
    color: '#38a169'
  },
  {
    id: 4,
    title: 'Release Notes',
    description: 'Stay updated with the latest features and fixes',
    icon: '📋',
    link: '/releases',
    color: '#9f7aea'
  },
  {
    id: 5,
    title: 'System Status',
    description: 'Check current system performance and uptime',
    icon: '📊',
    link: '/status',
    color: '#f56565'
  },
  {
    id: 6,
    title: 'Blog & Updates',
    description: 'Latest news, tips, and best practices',
    icon: '✍️',
    link: '/blog',
    color: '#ed64a6'
  }
];

export default function ResourceCards() {
  return (
    <section className={styles.resourcesSection}>
      <div className={styles.resourcesHeader}>
        <h2 className={styles.sectionTitle}>Helpful Resources</h2>
        <p className={styles.sectionSubtitle}>
          Explore these additional resources to get the most out of our platform
        </p>
      </div>
      
      <div className={styles.resourcesGrid}>
        {resources.map((resource) => (
          <a 
            key={resource.id} 
            href={resource.link} 
            className={styles.resourceCard}
            style={{ '--card-color': resource.color } as React.CSSProperties}
          >
            <div 
              className={styles.resourceIcon}
              style={{ backgroundColor: `${resource.color}15` }}
            >
              <span style={{ color: resource.color, fontSize: '24px' }}>
                {resource.icon}
              </span>
            </div>
            <h3 className={styles.resourceTitle}>{resource.title}</h3>
            <p className={styles.resourceDescription}>{resource.description}</p>
            <div className={styles.resourceLink}>
              Explore now →
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}