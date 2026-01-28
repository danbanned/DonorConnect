import { 
  CalendarIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../../../utils/formatCurrency'
import './SuggestedActions.css'

export default function SuggestedActions({ donor, insights }) {

  

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'action-item high'
      case 'medium': return 'action-item medium'
      case 'low': return 'action-item low'
      case 'info': return 'action-item info'
      default: return 'action-item default'
    }
  }

  const getIconContainerClass = (priority) => {
    switch (priority) {
      case 'high': return 'action-icon-container high'
      case 'medium': return 'action-icon-container medium'
      case 'low': return 'action-icon-container low'
      case 'info': return 'action-icon-container info'
      default: return 'action-icon-container default'
    }
  }

  const getIconClass = (priority) => {
    switch (priority) {
      case 'high': return 'action-icon high'
      case 'medium': return 'action-icon medium'
      case 'low': return 'action-icon low'
      case 'info': return 'action-icon info'
      default: return 'action-icon default'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <ExclamationTriangleIcon className="action-icon high" />
      case 'medium': return <ClockIcon className="action-icon medium" />
      case 'low': return <CheckCircleIcon className="action-icon low" />
      case 'info': return <CurrencyDollarIcon className="action-icon info" />
      default: return <CheckCircleIcon className="action-icon default" />
    }
  }

  // Get data from the actual structure
  const donorDonations = donor?.donations || []
  const donorSummary = donor?.summary || {}
  const donorMetrics = donor?.metrics || {}
  
  // Calculate derived values from actual data
  const giftsCount = donorDonations.length || 0
  const lastGiftDate = donorDonations.length > 0 
    ? new Date(donorDonations[0].date) // Assuming sorted by date
    : null
  
  const totalGiven = donorDonations.reduce((sum, donation) => sum + donation.amount, 0)
  const averageGift = giftsCount > 0 ? totalGiven / giftsCount : 0
  const daysSinceLastGift = lastGiftDate 
    ? Math.floor((new Date() - lastGiftDate) / (1000 * 60 * 60 * 24))
    : null
  
  // Get insights from the correct structure
  const engagementLevel = insights?.status?.engagementLevel || 'Unknown'
  const engagementScore = insights?.status?.engagementScore || 0
  const givingFrequency = insights?.givingFrequency || 'unknown'
  const suggestedAskAmount = insights?.suggestedAskAmount || 0
  const lastContact = insights?.lastContact || null
  const nextBestAction = insights?.nextBestAction || 'No action suggested'
  
  // Calculate if donor is LYBUNT (gave last year but not this year)
  const isLybunt = donorSummary?.lybuntCount > 0 || false
  const isSybunt = donorSummary?.sybuntCount > 0 || false

  const getNextAskDate = () => {
    if (!lastGiftDate) return new Date()
    const nextAsk = new Date(lastGiftDate)
    
    // Adjust based on giving frequency
    switch (givingFrequency) {
      case 'monthly':
        nextAsk.setMonth(nextAsk.getMonth() + 1)
        break
      case 'quarterly':
        nextAsk.setMonth(nextAsk.getMonth() + 3)
        break
      case 'annually':
        nextAsk.setFullYear(nextAsk.getFullYear() + 1)
        break
      default: // one-time
        nextAsk.setMonth(nextAsk.getMonth() + 6)
    }
    
    return nextAsk
  }

  // Build suggested actions based on actual data
  const suggestedActions = []

  // 1. Always show suggested ask if available
  if (suggestedAskAmount > 0) {
    suggestedActions.push({
      id: 'ask-amount',
      title: 'Suggested Ask Amount',
      description: `Based on ${givingFrequency} giving pattern`,
      icon: CurrencyDollarIcon,
      priority: 'info',
      amount: suggestedAskAmount,
      reason: `Average gift: ${formatCurrency(averageGift)}`
    })
  }

  // 2. LYBUNT/SYBUNT follow-ups (highest priority)
  if (isLybunt) {
    suggestedActions.push({
      id: 'lybunt',
      title: 'LYBUNT Donor',
      description: `Gave last year ($${donorSummary?.lybuntValue || 0}) but not this year`,
      icon: ExclamationTriangleIcon,
      priority: 'high',
      reason: 'High potential for re-engagement'
    })
  } else if (isSybunt) {
    suggestedActions.push({
      id: 'sybunt',
      title: 'SYBUNT Donor',
      description: 'Gave some years but not recently',
      icon: ClockIcon,
      priority: 'medium',
      reason: 'Moderate potential for re-engagement'
    })
  }

  // 3. Next best action from insights
  if (nextBestAction && nextBestAction !== 'No action suggested') {
    let icon = EnvelopeIcon
    let priority = 'medium'
    
    switch (nextBestAction.toLowerCase()) {
      case 'send thank you note':
        icon = EnvelopeIcon
        priority = 'medium'
        break
      case 'schedule call':
      case 'schedule meeting':
        icon = PhoneIcon
        priority = 'high'
        break
      case 'send update':
        icon = DocumentTextIcon
        priority = 'low'
        break
      case 'request meeting':
        icon = CalendarIcon
        priority = 'high'
        break
    }
    
    suggestedActions.push({
      id: 'next-best',
      title: 'AI Recommended Action',
      description: nextBestAction,
      icon,
      priority,
      reason: `Based on ${engagementLevel.toLowerCase()} engagement`
    })
  }

  // 4. Engagement-based actions
  if (engagementLevel === 'Low' && giftsCount > 0) {
    suggestedActions.push({
      id: 'engagement-low',
      title: 'Increase Engagement',
      description: 'Donor has low engagement score',
      icon: UserGroupIcon,
      priority: 'medium',
      reason: `Engagement score: ${engagementScore}/100`
    })
  }

  // 5. Time-based check-ins
  if (lastGiftDate) {
    const monthsSinceLastGift = daysSinceLastGift ? Math.floor(daysSinceLastGift / 30) : 0
    
    if (monthsSinceLastGift >= 6 && givingFrequency === 'one-time') {
      suggestedActions.push({
        id: 'follow-up',
        title: 'Follow-up Check-in',
        description: `It's been ${monthsSinceLastGift} months since last gift`,
        icon: CalendarIcon,
        priority: 'medium',
        suggestedDate: getNextAskDate(),
        reason: 'Standard follow-up timing'
      })
    }
  } else if (giftsCount === 0) {
    // New donor without gifts
    suggestedActions.push({
      id: 'welcome',
      title: 'Welcome New Donor',
      description: 'This donor hasn\'t made a gift yet',
      icon: EnvelopeIcon,
      priority: 'high',
      reason: 'First impression opportunity'
    })
  }

  // 6. Impact reporting (always good)
  suggestedActions.push({
    id: 'impact',
    title: 'Share Impact Report',
    description: `Show how ${totalGiven > 0 ? `their $${formatCurrency(totalGiven)}` : 'donations'} are making a difference`,
    icon: DocumentTextIcon,
    priority: 'low',
    reason: 'Strengthens donor relationship'
  })

  // Format date for display
  const formatActionDate = (date) => {
    if (!(date instanceof Date)) return ''
    const today = new Date()
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `In ${diffDays} days`
  }

  // Format last contact date
  const formatLastContact = () => {
    if (!lastContact) return 'No recent contact'
    const contactDate = new Date(lastContact)
    const diffDays = Math.floor((new Date() - contactDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div className="suggested-actions-card">
      <div className="suggested-actions-header">
        <div>
          <h3 className="suggested-actions-title">Suggested Actions</h3>
          <p className="suggested-actions-subtitle">
            AI-powered recommendations based on donor behavior
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
                    
                    {action.reason && (
                      <div className="action-reason">
                        <span className="action-reason-text">{action.reason}</span>
                      </div>
                    )}
                    
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
                      Request ${formatCurrency(action.amount, 0).replace('$', '')}
                    </button>
                    <button className="btn-secondary">
                      Adjust Amount
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-primary">
                      {action.title.includes('Donor') ? 'View Details' : 'Take Action'}
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
        <div className="stats-header">
          <h4>Donor Quick Stats</h4>
          <p className="stats-subtitle">Based on {giftsCount} gift{giftsCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <p className="stat-value">{giftsCount}</p>
            <p className="stat-label">Total Gifts</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">
              {formatCurrency(totalGiven)}
            </p>
            <p className="stat-label">Total Given</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">
              {formatCurrency(averageGift)}
            </p>
            <p className="stat-label">Average Gift</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">
              {daysSinceLastGift !== null ? `${daysSinceLastGift}d` : 'N/A'}
            </p>
            <p className="stat-label">Days Since Gift</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">
              {engagementLevel}
            </p>
            <p className="stat-label">Engagement</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">
              {formatLastContact()}
            </p>
            <p className="stat-label">Last Contact</p>
          </div>
        </div>
      </div>

      <div className="meeting-prep">
        <div className="meeting-prep-content">
          <div>
            <p className="meeting-prep-title">Generate Donor Brief</p>
            <p className="meeting-prep-description">
              AI-powered briefing for meetings or calls
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