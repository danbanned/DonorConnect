// app/donors/[id]/page.js
import { getDonorWithActivity } from '../../../lib/api/donor-data'
import DonorSummary from '../../components/donations/DonationSummary'
import DonorInsights from '../../components/donations/DonorInsights'
import DonorRelationship from '../../components/donations/RelationshipBuilder'
import DonorActivityTimeline from '../../components/donations/DonorActivityTimeline'
import DonorQuickActions from '../../components/donations/DonorQuickActions'
import styles from './DonorPage.module.css'

export default async function DonorPage({ params }) {
  // You need to get the organizationId from somewhere
  // This could come from:
  // 1. Your authentication/session
  // 2. Environment variables
  // 3. Or fetch it from the donor data first
  const organizationId = process.env.DEFAULT_ORGANIZATION_ID
  
  // First get basic donor to get organizationId
  let donor = await getDonorWithActivity(params.id, organizationId)
  console.log('Initial donor data:', donor)
  
  // If we don't have organizationId from env, try to get it from donor
  if (!donor && !organizationId) {
    // You might need to fetch basic donor first to get organizationId
    const basicDonorRes = await fetch(`http://localhost:3000/api/donors/${params.id}`)
    if (basicDonorRes.ok) {
      const basicDonor = await basicDonorRes.json()
      donor = await getDonorWithActivity(params.id, basicDonor.organizationId)
    }
  }
  
  console.log('Fetched donor data with activity:', donor)
  
  if (!donor) {
    return (
      <div className={styles.notFound}>
        <h2>Donor not found</h2>
        <p>The donor you're looking for doesn't exist or you don't have access.</p>
        <a href="/donors" className={styles.backLink}>← Back to Donors</a>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            {donor.firstName} {donor.lastName}
          </h1>
          <div className={styles.subtitleSection}>
            <span className={styles.donorId}>ID: {donor.id.slice(0, 8)}...</span>
            <span className={`${styles.statusBadge} ${styles[donor.relationshipStage?.toLowerCase()] || ''}`}>
              {donor.relationshipStage}
            </span>
            <span className={`${styles.statusBadge} ${styles[donor.status?.toLowerCase()] || ''}`}>
              {donor.status}
            </span>
            {donor.totalDonations > 0 && (
              <span className={styles.donationTotal}>
                Total: ${donor.totalDonations.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <DonorQuickActions donor={donor} />
      </div>

      <div className={styles.grid}>
        {/* Column 1: Summary & Activity Timeline */}
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Donor Summary</h2>
            <DonorSummary donor={donor} />
          </div>
          
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Activity Timeline</h2>
              <span className={styles.activityCount}>
                {donor.activityCount || 0} activities
              </span>
            </div>
            <DonorActivityTimeline activities={donor.activities} />
          </div>
        </div>

        {/* Column 2: Insights & Relationship */}
        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Donor Insights</h2>
            <DonorInsights donor={donor} />
          </div>
          
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Relationship Management</h2>
            <DonorRelationship donor={donor} />
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>Total Donations</span>
              <span className={styles.quickStatValue}>
                ${donor.totalDonations?.toLocaleString() || '0'}
              </span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>Donation Count</span>
              <span className={styles.quickStatValue}>{donor.donationCount || 0}</span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>Avg Donation</span>
              <span className={styles.quickStatValue}>
                ${donor.avgDonation?.toFixed(0) || '0'}
              </span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatLabel}>This Year</span>
              <span className={styles.quickStatValue}>
                ${donor.stats?.currentYearTotal?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Donations Section */}
      {donor.recentDonations && donor.recentDonations.length > 0 && (
        <div className={styles.fullWidthSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Donations</h2>
            <a href={`/donations?donorId=${donor.id}`} className={styles.viewAllLink}>
              View All Donations →
            </a>
          </div>
          <div className={styles.donationsGrid}>
            {donor.recentDonations.map(donation => (
              <div key={donation.id} className={styles.donationCard}>
                <div className={styles.donationHeader}>
                  <span className={styles.donationDate}>
                    {new Date(donation.date).toLocaleDateString()}
                  </span>
                  <span className={`${styles.donationStatus} ${styles[donation.status?.toLowerCase()] || ''}`}>
                    {donation.status}
                  </span>
                </div>
                <div className={styles.donationAmount}>
                  ${donation.amount?.toLocaleString()}
                </div>
                <div className={styles.donationDetails}>
                  <span className={styles.donationType}>{donation.type || 'One-time'}</span>
                  {donation.notes && (
                    <span className={styles.donationNotes} title={donation.notes}>
                      {donation.notes.length > 30 ? donation.notes.substring(0, 30) + '...' : donation.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Communications */}
      {donor.recentCommunications && donor.recentCommunications.length > 0 && (
        <div className={styles.fullWidthSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Communications</h2>
            <a href={`/communications?donorId=${donor.id}`} className={styles.viewAllLink}>
              View All Communications →
            </a>
          </div>
          <div className={styles.communicationsList}>
            {donor.recentCommunications.map(comm => (
              <div key={comm.id} className={styles.communicationItem}>
                <div className={styles.communicationIcon}>
                  {comm.type === 'EMAIL' ? '📧' : 
                   comm.type === 'PHONE_CALL' ? '📞' : '💬'}
                </div>
                <div className={styles.communicationInfo}>
                  <div className={styles.communicationHeader}>
                    <span className={styles.communicationType}>{comm.type?.replace('_', ' ')}</span>
                    <span className={styles.communicationDate}>
                      {new Date(comm.sentAt || comm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {comm.subject && (
                    <p className={styles.communicationSubject}>{comm.subject}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}