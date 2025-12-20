import { CalendarIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '@/utils/formatCurrency'
import  dateHelpers  from '@/utils/dateHelpers'
import styles from './PledgeBox.module.css'

export default function PledgeBox({ pledge }) {
  const getFrequencyText = (frequency) => {
    const map = {
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      ANNUALLY: 'Annually',
      CUSTOM: 'Custom'
    }
    return map[frequency] || frequency
  }

  const calculateProgress = () => {
    if (!pledge.pledgeTotal || !pledge.pledgePaid) return 0
    return (pledge.pledgePaid / pledge.pledgeTotal) * 100
  }

  const getDaysUntilNextPayment = () => {
    if (!pledge.pledgeStartDate) return null
    
    const startDate = new Date(pledge.pledgeStartDate)
    const today = new Date()
    
    // This is a simplified calculation - in reality, you'd calculate based on frequency
    const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
    return days % 30 // Assuming monthly payments
  }

  const progress = calculateProgress()
  const daysUntilNext = getDaysUntilNextPayment()
  const remaining = pledge.pledgeTotal - pledge.pledgePaid

  return (
    <div className={styles.pledgeBox}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <div className={styles.iconContainer}>
            <CurrencyDollarIcon className={styles.currencyIcon} />
          </div>
          <div>
            <h3 className={styles.title}>Active Pledge</h3>
            <p className={styles.subtitle}>
              {getFrequencyText(pledge.pledgeFrequency)} payments
            </p>
          </div>
        </div>
        <span className={styles.badge}>Pledge Active</span>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Progress</span>
          <span className={styles.progressAmount}>
            {formatCurrency(pledge.pledgePaid)} of {formatCurrency(pledge.pledgeTotal)}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.progressDetails}>
          <span>{progress.toFixed(1)}% complete</span>
          <span>{formatCurrency(remaining)} remaining</span>
        </div>
      </div>

      {/* Pledge Details */}
      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <CurrencyDollarIcon className={`${styles.detailIcon} ${styles.greenIcon}`} />
            <p className={styles.detailTitle}>Payment Schedule</p>
          </div>
          <p className={styles.detailValue}>
            {getFrequencyText(pledge.pledgeFrequency)}
          </p>
          <p className={styles.detailSubtitle}>
            {pledge.pledgePaidCount || '0'} of {pledge.pledgeTotalCount || '?'} payments made
          </p>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <CalendarIcon className={`${styles.detailIcon} ${styles.blueIcon}`} />
            <p className={styles.detailTitle}>Timeline</p>
          </div>
          <p className={styles.detailValue}>
            {dateHelpers.formatDate(pledge.pledgeStartDate, 'MMM yyyy')}
          </p>
          <p className={styles.detailSubtitle}>
            to {dateHelpers.formatDate(pledge.pledgeEndDate, 'MMM yyyy')}
          </p>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <CheckCircleIcon className={`${styles.detailIcon} ${styles.greenIcon}`} />
            <p className={styles.detailTitle}>Next Payment</p>
          </div>
          {daysUntilNext !== null && (
            <>
              <p className={styles.detailValue}>
                In {daysUntilNext} days
              </p>
              <p className={styles.detailSubtitle}>
                Due ~{dateHelpers.addDays(new Date(), daysUntilNext).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.primaryButton}>
          Record Payment
        </button>
        <button className={styles.secondaryButton}>
          View All Payments
        </button>
        <button className={styles.textButton}>
          Edit Pledge
        </button>
      </div>
    </div>
  )
}