import { CalendarIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '@/utils/formatCurrency'
import { dateHelpers } from '@/utils/dateHelpers'

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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Active Pledge</h3>
            <p className="text-sm text-gray-600">
              {getFrequencyText(pledge.pledgeFrequency)} payments
            </p>
          </div>
        </div>
        <span className="badge badge-info">Pledge Active</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-blue-700">
            {formatCurrency(pledge.pledgePaid)} of {formatCurrency(pledge.pledgeTotal)}
          </span>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{progress.toFixed(1)}% complete</span>
          <span>{formatCurrency(remaining)} remaining</span>
        </div>
      </div>

      {/* Pledge Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-gray-700">Payment Schedule</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {getFrequencyText(pledge.pledgeFrequency)}
          </p>
          <p className="text-sm text-gray-600">
            {pledge.pledgePaidCount || '0'} of {pledge.pledgeTotalCount || '?'} payments made
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-700">Timeline</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {dateHelpers.formatDate(pledge.pledgeStartDate, 'MMM yyyy')}
          </p>
          <p className="text-sm text-gray-600">
            to {dateHelpers.formatDate(pledge.pledgeEndDate, 'MMM yyyy')}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-gray-700">Next Payment</p>
          </div>
          {daysUntilNext !== null && (
            <>
              <p className="text-lg font-bold text-gray-900">
                In {daysUntilNext} days
              </p>
              <p className="text-sm text-gray-600">
                Due ~{dateHelpers.addDays(new Date(), daysUntilNext).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Record Payment
        </button>
        <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors duration-200">
          View All Payments
        </button>
        <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
          Edit Pledge
        </button>
      </div>
    </div>
  )
}