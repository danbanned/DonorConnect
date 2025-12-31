import { getDonorWithDetails } from '../../../lib/api/donor-data'
import DonorSummary from '../../components/donations/DonationSummary'
import DonorInsights from '../../components/donations/DonorInsights'
import DonorRelationship from '../../components/donations/RelationshipBuilder'
import styles from './DonorPage.module.css'

export default async function DonorPage({ params }) {
  const donor = await getDonorWithDetails(params.id)
  
  if (!donor) {
    return <div>Donor not found</div>
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {donor.firstName} {donor.lastName}
          </h1>
          <p className={styles.subtitle}>
            Donor ID: {donor.id} • {donor.relationshipStage} • {donor.status}
          </p>
        </div>
        <button className={styles.recordButton}>
          Record Donation
        </button>
      </div>

      <div className={styles.grid}>
        {/* Column 1: Summary & Basic Info */}
        <div className={styles.leftColumn}>
          <DonorSummary donor={donor} />
        </div>

        {/* Column 2: Insights & Analytics */}
        <div className={styles.rightColumn}>
          <DonorInsights donor={donor} />
          <DonorRelationship donor={donor} />
        </div>
      </div>
    </div>
  )
}