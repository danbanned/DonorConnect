import { 
  CalendarIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../../../utils/formatCurrency'
import './SuggestedActions.css'

export default function SuggestedActions({ donor, insights }) {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'action-item high'
      case 'medium': return 'action-item medium'
      case 'low': return 'action-item low'
      default: return 'action-item default'
    }
  }

  const getIconContainerClass = (priority) => {
    switch (priority) {
      case 'high': return 'action-icon-container high'
      case 'medium': return 'action-icon-container medium'
      case 'low': return 'action-icon-container low'
      default: return 'action-icon-container default'
    }
  }

  const getIconClass = (priority) => {
    switch (priority) {
      case 'high': return 'action-icon high'
      case 'medium': return 'action-icon medium'
      case 'low': return 'action-icon low'
      default: return 'action-icon default'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <ExclamationTriangleIcon className="action-icon high" />
      case 'medium': return <ClockIcon className="action-icon medium" />
      case 'low': return <CheckCircleIcon className="action-icon low" />
      default: return <CheckCircleIcon className="action-icon default" />
    }
  }

  const getNextAskDate = () => {
    if (!donor.lastGiftDate) return new Date()
    const lastGift = new Date(donor.lastGiftDate)
    const nextAsk = new Date(lastGift)
    nextAsk.setMonth(nextAsk.getMonth() + 6)
    return nextAsk
  }

  const suggestedActions = [
    {
      id: 1,
      title: 'Schedule Check-in Call',
      description: 'It\'s been 3 months since last contact',
      icon: PhoneIcon,
      priority: 'medium',
      suggestedDate: getNextAskDate(),
    },
    {
      id: 2,
      title: 'Send Impact Report',
      description: 'Share how their donations are making a difference',
      icon: EnvelopeIcon,
      priority: 'low',
    },
    {
      id: 3,
      title: 'Request Meeting',
      description: 'Discuss upcoming capital campaign',
      icon: CalendarIcon,
      priority: 'medium',
    },
  ]

  if (insights?.status?.isLybunt) {
    suggestedActions.unshift({
      id: 0,
      title: 'LYBUNT Follow-up',
      description: 'Donor gave last year but not this year',
      icon: ExclamationTriangleIcon,
      priority: 'high',
    })
  }

  if (insights?.suggestedAsk) {
    suggestedActions.unshift({
      id: -1,
      title: 'Suggested Ask Amount',
      description: `Based on giving history and engagement`,
      icon: CurrencyDollarIcon,
      priority: 'info',
      amount: insights.suggestedAsk,
    })
  }

  const formatActionDate = (date) => {
    if (!(date instanceof Date)) return ''
    const today = new Date()
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `In ${diffDays} days`
  }

  return (
    <div className="suggested-actions-card">
      <div className="suggested-actions-header">
        <div>
          <h3 className="suggested-actions-title">Suggested Actions</h3>
          <p className="suggested-actions-subtitle">
            Smart recommendations for this donor
          </p>
        </div>
        <span className="suggested-actions-badge">
          {suggestedActions.length} actions
        </span>
      </div>

      <div className="suggested-actions-list">
        {suggestedActions.map((action) => {
          const Icon = action.icon
          return (
            <div
              key={action.id}
              className={getPriorityClass(action.priority)}
            >
              <div className="action-content">
                <div className="action-main">
                  <div className={getIconContainerClass(action.priority)}>
                    {action.amount ? (
                      <span className="amount-text">
                        {formatCurrency(action.amount, 0).replace('$', '')}
                      </span>
                    ) : (
                      <Icon className={getIconClass(action.priority)} />
                    )}
                  </div>
                  <div className="action-details">
                    <div className="action-header">
                      <h4 className="action-title">{action.title}</h4>
                      {getPriorityIcon(action.priority)}
                    </div>
                    <p className="action-description">{action.description}</p>
                    
                    {action.suggestedDate && (
                      <div className="action-date">
                        <CalendarIcon className="action-date-icon" />
                        <span>{formatActionDate(action.suggestedDate)}</span>
                        <span className="action-divider">•</span>
                        <span>
                          {action.suggestedDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                {action.amount ? (
                  <>
                    <button className="btn-primary">
                      Request Donation
                    </button>
                    <button className="btn-secondary">
                      Adjust Amount
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-primary">
                      Take Action
                    </button>
                    <button className="btn-secondary">
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="quick-stats">
        <div className="stats-grid">
          <div className="stat-box">
            <p className="stat-value">{donor.giftsCount || 0}</p>
            <p className="stat-label">Total Gifts</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">{insights?.metrics?.daysSinceLastGift || 'N/A'}</p>
            <p className="stat-label">Days Since Last Gift</p>
          </div>
        </div>
      </div>

      <div className="meeting-prep">
        <div className="meeting-prep-content">
          <div>
            <p className="meeting-prep-title">Need Meeting Prep?</p>
            <p className="meeting-prep-description">
              Generate a comprehensive donor brief
            </p>
          </div>
          <button className="btn-primary">
            Generate Brief
          </button>
        </div>
      </div>
    </div>
  )
}