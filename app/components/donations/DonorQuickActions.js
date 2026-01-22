// app/components/donations/DonorQuickActions.js
'use client'

import { useRouter } from 'next/navigation'
import { 
  CurrencyDollarIcon, 
  EnvelopeIcon,
  CalendarIcon,
  PhoneIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function DonorQuickActions({ donor }) {
  const router = useRouter()

  const handleAction = (action) => {
    switch(action) {
      case 'record-donation':
        router.push(`/recorddonorpage/${donor.id}`)
        break
      case 'send-thank-you':
        router.push(`/communications/new?donorId=${donor.id}&type=THANK_YOU`)
        break
      case 'schedule-meeting':
        router.push(`/communications/schedule?donorId=${donor.id}`)
        break
      case 'add-note':
        router.push(`/donors/${donor.id}/notes`)
        break
      default:
        break
    }
  }

  const isLYBUNT = donor.relationshipStage === 'LYBUNT'
  const isSYBUNT = donor.relationshipStage === 'SYBUNT'

  return (
    <div className="w-full">
      {/* Primary Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleAction('record-donation')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CurrencyDollarIcon className="w-5 h-5" />
          Record Donation
        </button>
        
        <button
          onClick={() => handleAction('send-thank-you')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <EnvelopeIcon className="w-5 h-5" />
          Send Thank You
        </button>
        
        <button
          onClick={() => handleAction('schedule-meeting')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <CalendarIcon className="w-5 h-5" />
          Schedule Meeting
        </button>
      </div>

      {/* Alert for LYBUNT/SYBUNT donors */}
      {(isLYBUNT || isSYBUNT) && (
        <div className={`mb-4 p-3 rounded-lg ${
          isLYBUNT ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className={`w-5 h-5 flex-shrink-0 ${
              isLYBUNT ? 'text-yellow-600' : 'text-blue-600'
            }`} />
            <div className="flex-1">
              <strong className={`block mb-1 ${
                isLYBUNT ? 'text-yellow-800' : 'text-blue-800'
              }`}>
                {isLYBUNT ? 'LYBUNT Alert' : 'SYBUNT Alert'}
              </strong>
              <p className={`text-sm ${
                isLYBUNT ? 'text-yellow-700' : 'text-blue-700'
              }`}>
                {isLYBUNT 
                  ? 'This donor gave last year but not this year. Consider reaching out to renew their support.'
                  : 'This donor gave this year but not last year. Thank them for renewing their support.'}
              </p>
            </div>
            <button
              onClick={() => handleAction(isLYBUNT ? 'send-thank-you' : 'send-thank-you')}
              className={`px-3 py-1 text-sm rounded ${
                isLYBUNT 
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              {isLYBUNT ? 'Re-engage' : 'Thank'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Donated</div>
          <div className="text-lg font-bold text-gray-900">
            ${donor.totalDonations?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Donation Count</div>
          <div className="text-lg font-bold text-gray-900">
            {donor.donationCount || 0}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Gift</div>
          <div className="text-lg font-bold text-gray-900">
            ${donor.avgDonation?.toFixed(0) || '0'}
          </div>
        </div>
      </div>
    </div>
  )
}