import styles from './support.module.css';
import FAQSection from './FAQSection';
import SupportForm from './SupportForm';
import ResourceCards from './ResourceCards';

export const metadata = {
  title: 'Support Center',
  description: 'Get help, browse FAQs, and find resources to solve your issues quickly.',
};

export default function SupportPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <header className={styles.heroSection}>
        <h1 className={styles.heroTitle}>How can we help you today?</h1>
        <p className={styles.heroSubtitle}>
          Find answers in our knowledge base, connect with our community, or contact our support team.
        </p>
        
        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <input
            type="search"
            placeholder="Search for answers, articles, or guides..."
            className={styles.searchInput}
          />
          <button type="button" className={styles.searchButton}>
            🔍
          </button>
        </div>
      </header>

      {/* Quick Help Section */}
      <section className={styles.quickHelp}>
        <h2 className={styles.sectionTitle}>Quick Help</h2>
        <p className={styles.sectionSubtitle}>
          Choose the option that best describes what you need help with
        </p>
        
        <div className={styles.helpCategories}>
          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>📱</div>
            <h3 className={styles.helpTitle}>Account & Billing</h3>
            <p className={styles.helpDescription}>
              Manage your account, update payment methods, or billing questions
            </p>
            <a href="#account" className={styles.helpLink}>Get help →</a>
          </div>
          
          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>⚙️</div>
            <h3 className={styles.helpTitle}>Technical Issues</h3>
            <p className={styles.helpDescription}>
              Troubleshoot problems, bugs, or technical difficulties
            </p>
            <a href="#technical" className={styles.helpLink}>Troubleshoot →</a>
          </div>
          
          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>📚</div>
            <h3 className={styles.helpTitle}>Guides & Tutorials</h3>
            <p className={styles.helpDescription}>
              Step-by-step guides and video tutorials
            </p>
            <a href="#guides" className={styles.helpLink}>Learn more →</a>
          </div>
          
          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>💬</div>
            <h3 className={styles.helpTitle}>Community Forum</h3>
            <p className={styles.helpDescription}>
              Connect with other users and share solutions
            </p>
            <a href="#community" className={styles.helpLink}>Join discussion →</a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Resource Cards */}
      <ResourceCards />

      {/* Contact Support Form */}
      <section className={styles.contactSection}>
        <div className={styles.contactHeader}>
          <h2 className={styles.sectionTitle}>Still need help?</h2>
          <p className={styles.sectionSubtitle}>
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
        </div>
        
        <div className={styles.contactGrid}>
          <div className={styles.contactInfo}>
            <h3 className={styles.contactTitle}>Support Options</h3>
            
            <div className={styles.supportOption}>
              <div className={styles.optionIcon}>📧</div>
              <div>
                <h4 className={styles.optionTitle}>Email Support</h4>
                <p className={styles.optionDescription}>
                  Get help via email. We typically respond within 24 hours.
                </p>
                <p className={styles.optionDetail}>
                  <strong>Email:</strong> support@example.com
                </p>
              </div>
            </div>
            
            <div className={styles.supportOption}>
              <div className={styles.optionIcon}>🕒</div>
              <div>
                <h4 className={styles.optionTitle}>Response Times</h4>
                <p className={styles.optionDescription}>
                  Our support hours and typical response times
                </p>
                <ul className={styles.timingList}>
                  <li>Mon-Fri: 9 AM - 6 PM (PST)</li>
                  <li>Weekends: 10 AM - 4 PM (PST)</li>
                  <li>Emergency: 24/7 critical issue support</li>
                </ul>
              </div>
            </div>
            
            <div className={styles.supportOption}>
              <div className={styles.optionIcon}>📞</div>
              <div>
                <h4 className={styles.optionTitle}>Phone Support</h4>
                <p className={styles.optionDescription}>
                  Call us for immediate assistance with critical issues.
                </p>
                <p className={styles.optionDetail}>
                  <strong>Phone:</strong> 1-800-123-4567
                </p>
                <p className={styles.optionNote}>
                  Available for premium and enterprise customers
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.contactFormContainer}>
            <SupportForm />
          </div>
        </div>
      </section>

      {/* Status Indicator */}
      <div className={styles.statusIndicator}>
        <div className={styles.statusDot}></div>
        <span className={styles.statusText}>All systems operational</span>
        <a href="/status" className={styles.statusLink}>View status page</a>
      </div>
    </div>
  );
}