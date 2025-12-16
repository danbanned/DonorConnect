import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  StarIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/utils/formatCurrency'

export default function DonorHeader({ donor, insights }) {
  const getRelationshipColor = (stage) => {
    const colors = {
      NEW: 'bg-gray-100 text-gray-800',
      CULTIVATION: 'bg-blue-100 text-blue-800',
      ASK_READY: 'bg-yellow-100 text-yellow-800',
      STEWARDSHIP: 'bg-green-100 text-green-800',
      MAJOR_GIFT: 'bg-purple-100 text-purple-800',
      LEGACY: 'bg-indigo-100 text-indigo-800',
    }
    return colors[stage] || colors.NEW
  }

  const getDonorLevel = (totalGiven) => {
    if (totalGiven >= 10000) return 'Major Donor'
    if (totalGiven >= 5000) return 'Sustainer'
    if (totalGiven >= 1000) return 'Supporter'
    return 'Friend'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Left: Donor Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {donor.firstName} {donor.lastName}
                </h1>
                <span className={`badge ${getRelationshipColor(donor.relationshipStage)}`}>
                  {donor.relationshipStage.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{getDonorLevel(donor.totalGiven)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Member since {new Date(donor.firstGiftDate).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {donor.email && (
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href={`mailto:${donor.email}`}
                    className="text-gray-900 hover:text-blue-600"
                  >
                    {donor.email}
                  </a>
                </div>
              </div>
            )}
            
            {donor.phone && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a 
                    href={`tel:${donor.phone}`}
                    className="text-gray-900 hover:text-blue-600"
                  >
                    {donor.phone}
                  </a>
                </div>
              </div>
            )}
            
            {donor.address && (
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-gray-900">
                    {donor.address.street}, {donor.address.city}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tags & Interests */}
          <div className="mt-6">
            {donor.interests && donor.interests.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {donor.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {donor.tags && donor.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {donor.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
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
        <div className="lg:w-96 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Given</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(donor.totalGiven)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Gifts</p>
              <p className="text-2xl font-bold text-gray-900">
                {donor.giftsCount}
              </p>
            </div>
          </div>

          {/* Engagement Score */}
          {insights && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Engagement Score</p>
                <span className={`badge ${
                  insights.status.engagementScore >= 75 ? 'badge-success' :
                  insights.status.engagementScore >= 50 ? 'badge-warning' : 'badge-danger'
                }`}>
                  {insights.status.engagementLevel}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${insights.status.engagementScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Based on giving history and communication patterns
              </p>
            </div>
          )}

          {/* Last Gift */}
          {donor.lastGiftDate && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">Last Gift</p>
              </div>
              <p className="text-lg font-bold text-green-900">
                {formatCurrency(donor.lastDonation?.amount || 0)}
              </p>
              <p className="text-sm text-green-700">
                {new Date(donor.lastGiftDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}