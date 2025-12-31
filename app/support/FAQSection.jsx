import styles from './support.module.css';

const faqData = [
  {
    id: 1,
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. Enter your email address and follow the instructions sent to your inbox. If you don\'t receive the email within 5 minutes, check your spam folder.'
  },
  {
    id: 2,
    question: 'Can I change my subscription plan?',
    answer: 'Yes, you can upgrade or downgrade your subscription at any time from your account settings. Changes to your plan take effect immediately, and you\'ll be billed or credited prorated amounts.'
  },
  {
    id: 3,
    question: 'Where can I download my invoices?',
    answer: 'All invoices are available in your account under the Billing section. You can view, download, or print PDF versions of all past invoices. Monthly subscribers receive invoices via email as well.'
  },
  {
    id: 4,
    question: 'Is there a mobile app available?',
    answer: 'Yes, we have mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store. All features available on the web are also available in our mobile apps.'
  },
  {
    id: 5,
    question: 'How do I cancel my account?',
    answer: 'You can cancel your account at any time from the Account Settings page. Before canceling, you may want to download your data. Cancellation takes effect immediately, and you won\'t be charged again.'
  },
  {
    id: 6,
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through our PCI-compliant payment processor.'
  },
  {
    id: 7,
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee for all annual plans. Monthly plans can be canceled at any time with no further charges. To request a refund, please contact our support team with your account details.'
  },
  {
    id: 8,
    question: 'How secure is my data?',
    answer: 'We use enterprise-grade security including SSL/TLS encryption, regular security audits, and comply with GDPR and CCPA regulations. Your data is backed up daily and stored in secure, SOC 2 compliant data centers.'
  }
];

export default function FAQSection() {
  return (
    <section className={styles.faqSection}>
      <div className={styles.faqHeader}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <p className={styles.sectionSubtitle}>
          Browse through our most commonly asked questions and answers
        </p>
      </div>
      
      <div className={styles.faqGrid}>
        {faqData.map((item) => (
          <div key={item.id} className={styles.faqCard}>
            <h3 className={styles.faqQuestion}>{item.question}</h3>
            <p className={styles.faqAnswer}>{item.answer}</p>
          </div>
        ))}
      </div>
      
      <div className={styles.faqFooter}>
        <p className={styles.faqFooterText}>
          Still have questions? Check our <a href="/knowledge-base" className={styles.faqLink}>Knowledge Base</a> or <a href="#contact" className={styles.faqLink}>contact support</a>.
        </p>
      </div>
    </section>
  );
}