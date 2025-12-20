import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  StarIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/utils/formatCurrency'
import './DonorHeader.css'

export default function DonorHeader({ donor, insights }) {
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
              </div>
              
              <div className="donor-header-meta">
                <div className="donor-level">
                  <StarIcon className="donor-level-icon" />
                  <span className="donor-level-text">{getDonorLevel(donor.totalGiven)}</span>
                </div>
                <div className="donor-member-since">
                  <CalendarIcon className="donor-member-icon" />
                  <span>Member since {new Date(donor.firstGiftDate).getFullYear()}</span>
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
            
            {donor.address && (
              <div className="donor-contact-item">
                <MapPinIcon className="donor-contact-icon" />
                <div>
                  <p className="donor-contact-label">Address</p>
                  <p className="donor-contact-value">
                    {donor.address.street}, {donor.address.city}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tags & Interests */}
          <div className="donor-tags-section">
            {donor.interests && donor.interests.length > 0 && (
              <div className="donor-interests">
                <p className="donor-tags-label">Interests</p>
                <div className="donor-tags-container">
                  {donor.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="donor-interest-tag"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {donor.tags && donor.tags.length > 0 && (
              <div className="donor-tags">
                <p className="donor-tags-label">Tags</p>
                <div className="donor-tags-container">
                  {donor.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="donor-tag"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats */}
        <div className="donor-stats-section">
          <div className="donor-stats-grid">
            <div className="donor-stat-card">
              <p className="donor-stat-label">Total Given</p>
              <p className="donor-stat-value">
                {formatCurrency(donor.totalGiven)}
              </p>
            </div>
            
            <div className="donor-stat-card">
              <p className="donor-stat-label">Gifts</p>
              <p className="donor-stat-value">
                {donor.giftsCount}
              </p>
            </div>
          </div>

          {/* Engagement Score */}
          {insights && (
            <div className="donor-engagement-card">
              <div className="donor-engagement-header">
                <p className="donor-engagement-label">Engagement Score</p>
                <span className={`donor-engagement-level ${
                  insights.status.engagementScore >= 75 ? 'engagement-high' :
                  insights.status.engagementScore >= 50 ? 'engagement-medium' : 'engagement-low'
                }`}>
                  {insights.status.engagementLevel}
                </span>
              </div>
              <div className="donor-engagement-bar-container">
                <div 
                  className="donor-engagement-bar"
                  style={{ width: `${insights.status.engagementScore}%` }}
                />
              </div>
              <p className="donor-engagement-description">
                Based on giving history and communication patterns
              </p>
            </div>
          )}

          {/* Last Gift */}
          {donor.lastGiftDate && (
            <div className="donor-last-gift-card">
              <div className="donor-last-gift-header">
                <CurrencyDollarIcon className="donor-last-gift-icon" />
                <p className="donor-last-gift-label">Last Gift</p>
              </div>
              <p className="donor-last-gift-amount">
                {formatCurrency(donor.lastDonation?.amount || 0)}
              </p>
              <p className="donor-last-gift-date">
                {new Date(donor.lastGiftDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}