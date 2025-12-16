import { 
  CalendarIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/utils/formatCurrency'

export default function SuggestedActions({ donor, insights }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      case 'low': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'medium': return <ClockIcon className="h-5 w-5 text-yellow-600" />
      case 'low': return <CheckCircleIcon className="h-5 w-5 text-blue-600" />
      default: return <CheckCircleIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getNextAskDate = () => {
    if (!donor.lastGiftDate) return new Date()
    const lastGift = new Date(donor.lastGiftDate)
    const nextAsk = new Date(lastGift)
    nextAsk.setMonth(nextAsk.getMonth() + 6) // Suggest follow-up 6 months after last gift
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

  // Add LYBUNT action if applicable
  if (insights?.status?.isLybunt) {
    suggestedActions.unshift({
      id: 0,
      title: 'LYBUNT Follow-up',
      description: 'Donor gave last year but not this year',
      icon: ExclamationTriangleIcon,
      priority: 'high',
    })
  }

  // Add ask amount suggestion
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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Suggested Actions</h3>
          <p className="text-sm text-gray-600 mt-1">
            Smart recommendations for this donor
          </p>
        </div>
        <span className="badge badge-info">
          {suggestedActions.length} actions
        </span>
      </div>

      <div className="space-y-3">
        {suggestedActions.map((action) => {
          const Icon = action.icon
          return (
            <div
              key={action.id}
              className={`p-4 rounded-lg border ${getPriorityColor(action.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    action.priority === 'high' ? 'bg-red-100' :
                    action.priority === 'medium' ? 'bg-yellow-100' :
                    action.priority === 'low' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {action.amount ? (
                      <span className="font-bold text-gray-900">
                        {formatCurrency(action.amount, 0).replace('$', '')}
                      </span>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{action.title}</h4>
                      {getPriorityIcon(action.priority)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    
                    {action.suggestedDate && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatActionDate(action.suggestedDate)}</span>
                        <span className="text-gray-400">•</span>
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

              <div className="mt-4 flex gap-2">
                {action.amount ? (
                  <>
                    <button className="flex-1 btn-primary">
                      Request Donation
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                      Adjust Amount
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 btn-primary">
                      Take Action
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {donor.giftsCount || 0}
            </p>
            <p className="text-sm text-gray-600">Total Gifts</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {insights?.metrics?.daysSinceLastGift || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">Days Since Last Gift</p>
          </div>
        </div>
      </div>

      {/* Meeting Prep Link */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-900">Need Meeting Prep?</p>
            <p className="text-sm text-blue-700">
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