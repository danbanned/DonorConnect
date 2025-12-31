import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  StarIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../../../utils/formatCurrency'
import './DonorHeader.css'

export default function DonorHeader({ donor, insights, donations}) {
  // Calculate stats from donations data
  const totalGiven = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
  const giftsCount = donations.length;
  const lastDonation = donations.length > 0 
    ? donations.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;
  
  const getRelationshipColor = (stage) => {
    const colors = {
      NEW: 'donor-stage-new',
      CULTIVATION: 'donor-stage-cultivation',
      ASK_READY: 'donor-stage-ask-ready',
      STEWARDSHIP: 'donor-stage-stewardship',
      MAJOR_GIFT: 'donor-stage-major-gift',
      LEGACY: 'donor-stage-legacy',
    }
    return colors[stage] || 'donor-stage-new'
  }

  const getDonorLevel = (totalGiven) => {
    if (totalGiven >= 10000) return 'Major Donor'
    if (totalGiven >= 5000) return 'Sustainer'
    if (totalGiven >= 1000) return 'Supporter'
    return 'Friend'
  }

  // Get earliest donation year for member since
  const getMemberSinceYear = () => {
    if (donations.length === 0) return null;
    const earliestDonation = donations.reduce((earliest, current) => {
      return new Date(current.date) < new Date(earliest.date) ? current : earliest;
    });
    return new Date(earliestDonation.date).getFullYear();
  }

  // Extract notes from personalNotes object
  const getPersonalNotes = () => {
    if (donor.personalNotes && donor.personalNotes.notes) {
      return donor.personalNotes.notes;
    }
    return donor.notes || '';
  }

  return (
    <div className="donor-header-card">
      <div className="donor-header-content">
        {/* Left: Donor Info */}
        <div className="donor-header-info">
          <div className="donor-header-top">
            <div>
              <div className="donor-header-name-section">
                <h1 className="donor-header-name">
                  {donor.firstName} {donor.lastName}
                </h1>
                <span className={`donor-stage-badge ${getRelationshipColor(donor.relationshipStage)}`}>
                  {donor.relationshipStage.replace('_', ' ')}
                </span>
                <span className="donor-status-badge">
                  {donor.status}
                </span>
              </div>
              
              <div className="donor-header-meta">
                <div className="donor-level">
                  <StarIcon className="donor-level-icon" />
                  <span className="donor-level-text">{getDonorLevel(totalGiven)}</span>
                </div>
                <div className="donor-member-since">
                  <CalendarIcon className="donor-member-icon" />
                  <span>
                    {getMemberSinceYear() 
                      ? `Donor since ${getMemberSinceYear()}`
                      : 'No donations yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="donor-contact-grid">
            {donor.email && (
              <div className="donor-contact-item">
                <EnvelopeIcon className="donor-contact-icon" />
                <div>
                  <p className="donor-contact-label">Email</p>
                  <a 
                    href={`mailto:${donor.email}`}
                    className="donor-contact-value"
                  >
                    {donor.email}
                  </a>
                </div>
              </div>
            )}
            
            {donor.phone && (
              <div className="donor-contact-item">
                <PhoneIcon className="donor-contact-icon" />
                <div>
                  <p className="donor-contact-label">Phone</p>
                  <a 
                    href={`tel:${donor.phone}`}
                    className="donor-contact-value"
                  >
                    {donor.phone}
                  </a>
                </div>
              </div>
            )}
            
            {donor.address ? (
              <div className="donor-contact-item">
                <MapPinIcon className="donor-contact-icon" />
                <div>
                  <p className="donor-contact-label">Address</p>
                  <p className="donor-contact-value">
                    {donor.address.street}, {donor.address.city}
                  </p>
                </div>
              </div>
            ) : (
              <div className="donor-contact-item">
                <MapPinIcon className="donor-contact-icon" />
                <div>
                  <p className="donor-contact-label">Contact Preference</p>
                  <p className="donor-contact-value">
                    {donor.preferredContact}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          {getPersonalNotes() && (
            <div className="donor-notes-section">
              <p className="donor-notes-label">Notes</p>
              <div className="donor-notes-content">
                {getPersonalNotes()}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats */}
        <div className="donor-stats-section">
          <div className="donor-stats-grid">
            <div className="donor-stat-card">
              <p className="donor-stat-label">Total Given</p>
              <p className="donor-stat-value">
                {formatCurrency(totalGiven)}
              </p>
            </div>
            
            <div className="donor-stat-card">
              <p className="donor-stat-label">Gifts</p>
              <p className="donor-stat-value">
                {giftsCount}
              </p>
            </div>
          </div>

          {/* Last Gift */}
          {lastDonation && (
            <div className="donor-last-gift-card">
              <div className="donor-last-gift-header">
                <CurrencyDollarIcon className="donor-last-gift-icon" />
                <p className="donor-last-gift-label">Last Gift</p>
              </div>
              <p className="donor-last-gift-amount">
                {formatCurrency(lastDonation.amount)}
              </p>
              <p className="donor-last-gift-date">
                {new Date(lastDonation.date).toLocaleDateString()}
              </p>
              {lastDonation.notes && (
                <p className="donor-last-gift-notes">
                  Note: {lastDonation.notes}
                </p>
              )}
            </div>
          )}

          {/* Engagement Score (conditional) */}
          {insights ? (
            <div className="donor-engagement-card">
              <div className="donor-engagement-header">
                <p className="donor-engagement-label">Engagement Score</p>
                <span className={`donor-engagement-level ${
                  insights.engagementScore >= 75 ? 'engagement-high' :
                  insights.engagementScore >= 50 ? 'engagement-medium' : 'engagement-low'
                }`}>
                  {insights.engagementLevel}
                </span>
              </div>
              <div className="donor-engagement-bar-container">
                <div 
                  className="donor-engagement-bar"
                  style={{ width: `${insights.engagementScore}%` }}
                />
              </div>
              <p className="donor-engagement-description">
                Based on giving history and communication patterns
              </p>
            </div>
          ) : (
            <div className="donor-engagement-card">
              <div className="donor-engagement-header">
                <p className="donor-engagement-label">Engagement Score</p>
                <span className="donor-engagement-level">
                  {totalGiven > 0 ? 'Calculating...' : 'No Activity'}
                </span>
              </div>
              <div className="donor-engagement-bar-container">
                <div 
                  className="donor-engagement-bar"
                  style={{ 
                    width: `${Math.min(100, (totalGiven / 1000) * 100)}%`,
                    backgroundColor: totalGiven > 0 ? '#3b82f6' : '#9ca3af'
                  }}
                />
              </div>
              <p className="donor-engagement-description">
                Based on ${totalGiven} total given across {giftsCount} gifts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}